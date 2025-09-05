from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.job import Job
from app.models.resume import Resume
from app.services.ai_matching import ai_matcher
from app.utils.dependencies import get_current_user, get_current_employer
from app.models.user import User
from typing import List, Dict, Any
import json

router = APIRouter()

@router.post("/match/jobs-for-resume/{resume_id}")
def match_jobs_for_resume(
    resume_id: int,
    top_k: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Find matching jobs for a resume using AI"""
    # Get resume
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Get all jobs for indexing
    jobs = db.query(Job).filter(Job.source == "internal").all()
    job_dicts = [job.to_dict() for job in jobs]
    
    # Create or update index
    ai_matcher.create_job_index(job_dicts)
    
    # Get matches
    skills = json.loads(resume.skills) if resume.skills else []
    matches = ai_matcher.find_matching_jobs(
        resume.parsed_text or "",
        skills,
        top_k
    )
    
    # Get full job details for matches
    results = []
    for match in matches:
        job = db.query(Job).filter(Job.id == match['job_id']).first()
        if job:
            results.append({
                'job': job.to_dict(),
                'match_score': match['score'],
                'rank': match['rank']
            })
    
    return {
        'resume_id': resume_id,
        'total_matches': len(results),
        'matches': sorted(results, key=lambda x: x['match_score'], reverse=True)
    }

@router.post("/match/candidates-for-job/{job_id}")
def match_candidates_for_job(
    job_id: int,
    top_k: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employer)  # Only employers
):
    """Find matching candidates for a job using AI"""
    # Get job
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.employer_id == current_user.id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get all resumes for indexing
    resumes = db.query(Resume).all()
    resume_dicts = []
    for resume in resumes:
        resume_dict = resume.to_dict()
        resume_dict['skills'] = json.loads(resume.skills) if resume.skills else []
        resume_dicts.append(resume_dict)
    
    # Create or update index
    ai_matcher.create_resume_index(resume_dicts)
    
    # Get matches
    job_text = f"{job.title} {job.description} {job.requirements}"
    matches = ai_matcher.find_matching_candidates(job_text, top_k)
    
    # Get full resume details for matches
    results = []
    for match in matches:
        resume = db.query(Resume).filter(Resume.id == match['resume_id']).first()
        if resume:
            results.append({
                'resume': resume.to_dict(),
                'match_score': match['score'],
                'rank': match['rank']
            })
    
    return {
        'job_id': job_id,
        'total_matches': len(results),
        'matches': sorted(results, key=lambda x: x['match_score'], reverse=True)
    }

@router.get("/recommendations")
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI-powered job recommendations for current user"""
    # Get user's latest resume
    resume = db.query(Resume).filter(
        Resume.user_id == current_user.id
    ).order_by(Resume.created_at.desc()).first()
    
    if not resume:
        return {'message': 'No resume found. Upload a resume to get recommendations.'}
    
    # Get matches
    matches = match_jobs_for_resume(resume.id, 10, db, current_user)
    
    return matches

@router.post("/similar-jobs")
def find_similar_jobs(
    job_id: int,
    top_k: int = 5,
    db: Session = Depends(get_db)
):
    """Find jobs similar to a given job"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get all jobs
    jobs = db.query(Job).filter(Job.source == "internal").all()
    job_dicts = [j.to_dict() for j in jobs]
    
    # Create index
    ai_matcher.create_job_index(job_dicts)
    
    # Find similar jobs (excluding the current job)
    job_text = f"{job.title} {job.description} {job.requirements}"
    query_embedding = ai_matcher.generate_embedding(job_text)
    query_embedding = np.array([query_embedding]).astype('float32')
    
    distances, indices = ai_matcher.job_index.search(query_embedding, top_k + 1)
    
    similar_jobs = []
    for i, (distance, idx) in enumerate(zip(distances[0], indices[0])):
        if idx < len(ai_matcher.job_ids) and ai_matcher.job_ids[idx] != job_id:
            similar_job = db.query(Job).filter(Job.id == ai_matcher.job_ids[idx]).first()
            if similar_job:
                match_score = max(0, 100 - (distance * 10))
                similar_jobs.append({
                    'job': similar_job.to_dict(),
                    'similarity_score': round(min(100, match_score), 2)
                })
    
    return {
        'original_job_id': job_id,
        'similar_jobs': similar_jobs[:top_k]  # Return only top_k
    }