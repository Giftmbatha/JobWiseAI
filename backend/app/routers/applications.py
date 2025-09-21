from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.models.resume import Resume
from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationUpdate
from app.services.application_service import ApplicationService
from app.utils.dependencies import get_current_user

router = APIRouter()

@router.post("/", response_model=ApplicationResponse)
async def apply_to_job(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        application = await ApplicationService.apply_to_job(db, current_user.id, application_data)
        
        # Get additional data for response
        application_data = db.query(
            Application,
            Job.title.label("job_title"),
            Job.company.label("company_name"),
            Resume.name.label("resume_name")
        ).join(Job, Application.job_id == Job.id)\
         .outerjoin(Resume, Application.resume_id == Resume.id)\
         .filter(Application.id == application.id).first()
        
        return application_data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# app/routers/applications.py - UPDATE RESPONSE HANDLING
@router.get("/my-applications", response_model=List[ApplicationResponse])
async def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    applications = await ApplicationService.get_user_applications(db, current_user.id)
    
    # Get applications with additional data
    applications_data = db.query(
        Application,
        Job.title.label("job_title"),
        Job.company.label("company_name"),
        Resume.name.label("resume_name")
    ).join(Job, Application.job_id == Job.id)\
     .outerjoin(Resume, Application.resume_id == Resume.id)\
     .filter(Application.user_id == current_user.id)\
     .order_by(Application.applied_at.desc()).all()
    
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
async def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    application = await ApplicationService.get_application_by_id(db, application_id, current_user.id)
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Get additional data
    application_data = db.query(
        Application,
        Job.title.label("job_title"),
        Job.company.label("company_name"),
        Resume.name.label("resume_name")
    ).join(Job, Application.job_id == Job.id)\
     .outerjoin(Resume, Application.resume_id == Resume.id)\
     .filter(Application.id == application_id).first()
    
    if not application_data:
        raise HTTPException(status_code=404, detail="Application not found")
    
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