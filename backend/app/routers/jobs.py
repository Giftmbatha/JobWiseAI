# app/routers/jobs.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.job import Job
from app.models.user import User
from app.schemas.job import JobResponse, JobListResponse, JobCreate
from app.services.job_fetcher import AdzunaJobFetcher
from app.utils.dependencies import get_current_user, get_current_employer
import json

router = APIRouter()

@router.get("/", response_model=JobListResponse)
def get_jobs(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str = Query(None),
    location: str = Query(None),
    fetch_external: bool = Query(False),  # New parameter to fetch from Adzuna
    db: Session = Depends(get_db)
):
    # Fetch from Adzuna if requested
    if fetch_external and (search or location):
        AdzunaJobFetcher.fetch_and_store_jobs(search, location, 20, db)
    
    # Query both internal and external jobs
    query = db.query(Job)
    
    if search:
        query = query.filter(
            (Job.title.ilike(f"%{search}%")) |
            (Job.company.ilike(f"%{search}%")) |
            (Job.description.ilike(f"%{search}%")) |
            (Job.requirements.ilike(f"%{search}%"))
        )
    
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    
    # Sort with internal jobs first, then newest first
    query = query.order_by(
        Job.source.desc(),  # Internal jobs first
        Job.created_at.desc()  # Newest first
    )
    
    total_count = query.count()
    jobs = query.offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "jobs": jobs,
        "total_count": total_count,
        "page": page,
        "page_size": page_size
    }

@router.post("/", response_model=JobResponse)
def create_job(
    job_data: JobCreate,
    current_user: User = Depends(get_current_employer),
    db: Session = Depends(get_db)
):
    """Create a new job posting (for employers)"""
    # Check if user is employer (you can add role-based authentication later)
    if not current_user.role:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employers can create job postings"
        )
    
    job = Job(**job_data.dict(), source="internal")
    db.add(job)
    db.commit()
    db.refresh(job)
    
    return job

@router.get("/employer", response_model=JobListResponse)
def get_employer_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get jobs posted by the current employer"""
    # For now, all internal jobs. Later you can add user_id to Job model
    jobs = db.query(Job).filter(Job.source == "internal").all()
    
    return {
        "jobs": jobs,
        "total_count": len(jobs),
        "page": 1,
        "page_size": len(jobs)
    }

@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_data: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a job posting (employer only)"""
    job = db.query(Job).filter(Job.id == job_id, Job.source == "internal").first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found or not editable"
        )
    
    for key, value in job_data.dict().items():
        setattr(job, key, value)
    
    db.commit()
    db.refresh(job)
    
    return job

@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a job posting (employer only)"""
    job = db.query(Job).filter(Job.id == job_id, Job.source == "internal").first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found or not deletable"
        )
    
    db.delete(job)
    db.commit()
    
    return {"message": "Job deleted successfully"}

@router.post("/fetch-adzuna")
def fetch_adzuna_jobs(
    search_term: str = Query(""),
    location: str = Query("za"),
    results_per_page: int = Query(20),
    db: Session = Depends(get_db)
):
    """Manually fetch jobs from Adzuna API"""
    jobs_created = AdzunaJobFetcher.fetch_and_store_jobs(
        search_term, location, results_per_page, db
    )
    
    return {
        "message": f"Fetched and stored {jobs_created} new jobs from Adzuna",
        "jobs_created": jobs_created
    }