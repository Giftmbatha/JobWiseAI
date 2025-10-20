from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.models.resume import Resume
from app.schemas.application import ApplicationResponse, ApplicationUpdate
from app.utils.dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ApplicationResponse])
async def get_employer_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    job_id: Optional[int] = Query(None, description="Filter by job ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """
    Get all applications for jobs posted by the current employer
    """
    # Query jobs posted by this employer
    employer_jobs_query = db.query(Job.id).filter(Job.employer_id == current_user.id)
    
    if job_id:
        # Verify the job belongs to the employer
        job = db.query(Job).filter(Job.id == job_id, Job.employer_id == current_user.id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found or access denied")
        employer_jobs_query = employer_jobs_query.filter(Job.id == job_id)
    
    employer_job_ids = [job_id for (job_id,) in employer_jobs_query.all()]
    
    if not employer_job_ids:
        return []
    
    # Query applications for these jobs
    query = db.query(
        Application,
        Job.title.label("job_title"),
        Job.company.label("company_name"),
        Resume.name.label("resume_name")
    ).join(Job, Application.job_id == Job.id)\
     .outerjoin(Resume, Application.resume_id == Resume.id)\
     .filter(Application.job_id.in_(employer_job_ids))
    
    # Apply status filter
    if status:
        query = query.filter(Application.status == status)
    
    applications_data = query.order_by(Application.applied_at.desc())\
                           .offset(skip).limit(limit).all()
    
    # Convert to response format
    response_data = []
    for app, job_title, company_name, resume_name in applications_data:
        response_data.append(ApplicationResponse(
            id=app.id,
            user_id=app.user_id,
            job_id=app.job_id,
            resume_id=app.resume_id,
            status=app.status,
            cover_letter=app.cover_letter,
            applied_at=app.applied_at,
            updated_at=app.updated_at,
            job_title=job_title,
            company_name=company_name,
            resume_name=resume_name
        ))
    
    return response_data

@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_employer_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get specific application details (employer view)
    """
    application_data = db.query(
        Application,
        Job.title.label("job_title"),
        Job.company.label("company_name"),
        Resume.name.label("resume_name")
    ).join(Job, Application.job_id == Job.id)\
     .outerjoin(Resume, Application.resume_id == Resume.id)\
     .filter(
        Application.id == application_id,
        Job.employer_id == current_user.id  # Ensure employer owns the job
     ).first()
    
    if not application_data:
        raise HTTPException(status_code=404, detail="Application not found or access denied")
    
    app, job_title, company_name, resume_name = application_data
    return ApplicationResponse(
        id=app.id,
        user_id=app.user_id,
        job_id=app.job_id,
        resume_id=app.resume_id,
        status=app.status,
        cover_letter=app.cover_letter,
        applied_at=app.applied_at,
        updated_at=app.updated_at,
        job_title=job_title,
        company_name=company_name,
        resume_name=resume_name
    )

@router.patch("/{application_id}", response_model=ApplicationResponse)
async def update_application_status(
    application_id: int,
    application_update: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update application status (employer only)
    """
    # Find application and verify employer owns the job
    application = db.query(Application).join(Job).filter(
        Application.id == application_id,
        Job.employer_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found or access denied")
    
    # Update status if provided
    if application_update.status:
        valid_statuses = ["pending", "reviewed", "interviewing", "rejected", "offered", "hired"]
        if application_update.status not in valid_statuses:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        application.status = application_update.status
    
    # Update cover letter if provided (rare for employer, but possible)
    if application_update.cover_letter is not None:
        application.cover_letter = application_update.cover_letter
    
    try:
        db.commit()
        db.refresh(application)
        
        # Get updated data with joins
        application_data = db.query(
            Application,
            Job.title.label("job_title"),
            Job.company.label("company_name"),
            Resume.name.label("resume_name")
        ).join(Job, Application.job_id == Job.id)\
         .outerjoin(Resume, Application.resume_id == Resume.id)\
         .filter(Application.id == application_id).first()
        
        app, job_title, company_name, resume_name = application_data
        return ApplicationResponse(
            id=app.id,
            user_id=app.user_id,
            job_id=app.job_id,
            resume_id=app.resume_id,
            status=app.status,
            cover_letter=app.cover_letter,
            applied_at=app.applied_at,
            updated_at=app.updated_at,
            job_title=job_title,
            company_name=company_name,
            resume_name=resume_name
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update application")

@router.get("/jobs/{job_id}/stats")
async def get_job_application_stats(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get application statistics for a specific job
    """
    # Verify job belongs to employer
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found or access denied")
    
    # Get application counts by status
    status_counts = db.query(
        Application.status,
        db.func.count(Application.id).label('count')
    ).filter(Application.job_id == job_id)\
     .group_by(Application.status).all()
    
    total_applications = db.query(Application).filter(Application.job_id == job_id).count()
    
    return {
        "job_id": job_id,
        "job_title": job.title,
        "total_applications": total_applications,
        "status_breakdown": {status: count for status, count in status_counts},
        "recent_applications": db.query(Application)
            .filter(Application.job_id == job_id)
            .order_by(Application.applied_at.desc())
            .limit(5).count()
    }