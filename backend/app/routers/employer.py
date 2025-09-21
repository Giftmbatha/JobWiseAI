from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.models.job import Job
from app.models.resume import Resume
from app.models.user import User
from app.services.ai_matching import get_ai_matcher
from app.utils.dependencies import get_current_user, get_current_employer
from app.utils.permissions import require_employer_role

router = APIRouter()

class ContactCandidateRequest(BaseModel):
    message: str
    job_id: Optional[int] = None

@router.get("/candidates/batch-recommendations")
async def get_batch_candidate_recommendations(
    job_ids: Optional[List[int]] = Query(None),
    top_k_per_job: int = Query(5, ge=1, le=20),
    min_score: float = Query(50.0, ge=0.0, le=100.0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employer)
):
    """Get candidate recommendations for multiple jobs at once"""
    
    try:
        # Get employer's jobs
        query = db.query(Job).filter(Job.employer_id == current_user.id)
        if job_ids:
            query = query.filter(Job.id.in_(job_ids))
        
        jobs = query.all()
        
        if not jobs:
            raise HTTPException(status_code=404, detail="No jobs found for this employer")
        
        # Get all active resumes
        resumes = db.query(Resume).filter(Resume.content.isnot(None)).all()
        
        if not resumes:
            return {
                'total_jobs': len(jobs),
                'total_candidates': 0,
                'results': {},
                'filters': {
                    'top_k_per_job': top_k_per_job,
                    'min_score': min_score
                }
            }
        
        # Prepare resume data
        resumes_data = []
        for resume in resumes:
            resumes_data.append({
                'id': resume.id,
                'user_id': resume.user_id,
                'content': resume.content,
                'skills': resume.skills_json or [],
                'experience': resume.experience_json or [],
                'education': resume.education_json or [],
                'uploaded_at': resume.uploaded_at.isoformat() if resume.uploaded_at else None
            })
        
        # Prepare job data
        jobs_data = []
        for job in jobs:
            jobs_data.append({
                'id': job.id,
                'title': job.title,
                'company': job.company,
                'location': job.location,
                'description': job.description or '',
                'requirements': job.requirements or '',
                'job_type': job.job_type,
                'is_external': False,
                'source': 'internal'
            })
        
        # Get AI matcher
        matcher = get_ai_matcher()
        
        # Update resume index if needed
        if not matcher.resume_index or matcher.should_rebuild_index():
            matcher.create_resume_index(resumes_data)
        
        # Get batch recommendations
        batch_results = {}
        for job in jobs_data:
            job_id = job['id']
            recommendations = matcher.find_candidates_for_job(
                job, top_k_per_job, min_score
            )
            batch_results[job_id] = recommendations

        # Enhance with user information
        enhanced_results = {}
        for job_id, candidates in batch_results.items():
            enhanced_candidates = []
            for candidate in candidates:
                resume_data = candidate['resume']
                user = db.query(User).filter(User.id == resume_data['user_id']).first()
                
                if user:
                    enhanced_candidate = {
                        'score': candidate['score'],
                        'rank': candidate['rank'],
                        'distance': candidate.get('distance', 0),
                        'relevance': candidate.get('relevance', {}),
                        'candidate': {
                            'user_id': user.id,
                            'full_name': user.full_name,
                            'email': user.email,
                            'resume_id': resume_data['id'],
                            'resume_uploaded': resume_data['uploaded_at']
                        }
                    }
                    enhanced_candidates.append(enhanced_candidate)
            
            enhanced_results[job_id] = enhanced_candidates
        
        return {
            'total_jobs': len(jobs_data),
            'total_candidates': len(resumes_data),
            'results': enhanced_results,
            'filters': {
                'top_k_per_job': top_k_per_job,
                'min_score': min_score
            }
        }
    
    except Exception as e:
        print(f"Error in batch candidate recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate batch recommendations")

@router.get("/candidates/recommendations/{job_id}")
async def get_candidate_recommendations(
    job_id: int,
    top_k: int = Query(10, ge=1, le=50),
    min_score: float = Query(50.0, ge=0.0, le=100.0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employer)
):
    """Get AI-powered candidate recommendations for a specific job"""
    
    try:
        # Verify the job belongs to the employer
        job = db.query(Job).filter(
            Job.id == job_id,
            Job.employer_id == current_user.id
        ).first()
        
        if not job:
            raise HTTPException(status_code=404, detail="Job not found or access denied")
        
        # Get all active resumes
        resumes = db.query(Resume).filter(Resume.content.isnot(None)).all()
        
        if not resumes:
            return {
                'job_id': job_id,
                'job_title': job.title,
                'total_candidates': 0,
                'recommendations': [],
                'filters': {
                    'top_k': top_k,
                    'min_score': min_score
                }
            }
        
        # Prepare resume data for AI matching
        resumes_data = []
        for resume in resumes:
            resumes_data.append({
                'id': resume.id,
                'user_id': resume.user_id,
                'content': resume.content,
                'skills': resume.skills_json or [],
                'experience': resume.experience_json or [],
                'education': resume.education_json or [],
                'uploaded_at': resume.uploaded_at.isoformat() if resume.uploaded_at else None
            })
        
        # Prepare job data
        job_data = {
            'id': job.id,
            'title': job.title,
            'company': job.company,
            'location': job.location,
            'description': job.description or '',
            'requirements': job.requirements or '',
            'job_type': job.job_type,
            'is_external': False,
            'source': 'internal'
        }
        
        # Get AI matcher
        matcher = get_ai_matcher()
        
        # Update resume index if needed
        if not matcher.resume_index or matcher.should_rebuild_index():
            matcher.create_resume_index(resumes_data)
        
        # Get candidate recommendations
        recommendations = matcher.find_candidates_for_job(
            job_data, top_k, min_score
        )
        
        # Enhance with user information
        enhanced_recommendations = []
        for rec in recommendations:
            resume_data = rec['resume']
            user = db.query(User).filter(User.id == resume_data['user_id']).first()
            
            if user:
                enhanced_rec = {
                    'score': rec['score'],
                    'rank': rec['rank'],
                    'distance': rec.get('distance', 0),
                    'relevance': rec.get('relevance', {}),
                    'candidate': {
                        'user_id': user.id,
                        'full_name': user.full_name,
                        'email': user.email,
                        'resume_id': resume_data['id'],
                        'resume_uploaded': resume_data['uploaded_at']
                    }
                }
                enhanced_recommendations.append(enhanced_rec)
        
        return {
            'job_id': job_id,
            'job_title': job.title,
            'total_candidates': len(resumes_data),
            'recommendations': enhanced_recommendations,
            'filters': {
                'top_k': top_k,
                'min_score': min_score
            }
        }
    
    except Exception as e:
        print(f"Error in candidate recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate candidate recommendations")

@router.post("/candidates/contact/{candidate_id}")
async def contact_candidate(
    candidate_id: int,
    request: ContactCandidateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employer)
):
    """Contact a candidate via email (simulated)"""
    
    try:
        # Verify candidate exists
        candidate = db.query(User).filter(
            User.id == candidate_id,
            User.role == 'job_seeker'
        ).first()
        
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidate not found")
        
        # Get job details if job_id provided
        job_info = ""
        if request.job_id:
            job = db.query(Job).filter(
                Job.id == request.job_id,
                Job.employer_id == current_user.id
            ).first()
            if job:
                job_info = f" regarding the position: {job.title} at {job.company}"
        
        # Simulate sending email
        email_content = f"""
        Subject: Job Opportunity{job_info}
        
        Dear {candidate.full_name},
        
        {request.message}
        
        Best regards,
        {current_user.full_name}
        {current_user.company if hasattr(current_user, 'company') else current_user.email}
        """
        
        print(f"Simulated email sent to {candidate.email}:\n{email_content}")
        
        return {
            "message": f"Contacted candidate {candidate.full_name}",
            "email": candidate.email,
            "status": "success"
        }
    
    except Exception as e:
        print(f"Error contacting candidate: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to contact candidate")

@router.get("/jobs")
async def get_employer_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employer)
):
    """Get all jobs for the current employer"""
    try:
        jobs = db.query(Job).filter(Job.employer_id == current_user.id).all()
        return {
            "total_jobs": len(jobs),
            "jobs": jobs
        }
    except Exception as e:
        print(f"Error fetching employer jobs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch jobs")