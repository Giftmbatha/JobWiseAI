from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.application import Application
from app.models.user import User
from app.models.job import Job
from app.models.resume import Resume
from app.schemas.application import ApplicationCreate
from datetime import datetime

class ApplicationService:
    @staticmethod
    async def apply_to_job(db: Session, user_id: int, application_data: ApplicationCreate):
        # Check if job exists and is NOT external (can be internal or external with source='adzuna' but is_external=False)
        job = db.query(Job).filter(
            Job.id == application_data.job_id,
            Job.is_external == False  # Only allow applications to non-external jobs
        ).first()
        
        if not job:
            raise ValueError("Job not found or external jobs cannot be applied to directly")
        
        # Check if user already applied
        existing_application = db.query(Application).filter(
            Application.user_id == user_id,
            Application.job_id == application_data.job_id
        ).first()
        
        if existing_application:
            raise ValueError("You have already applied to this job")
        
        # Check if resume belongs to user (if provided)
        if application_data.resume_id:
            resume = db.query(Resume).filter(
                Resume.id == application_data.resume_id,
                Resume.user_id == user_id
            ).first()
            if not resume:
                raise ValueError("Resume not found or doesn't belong to user")
        
        # Create application
        application = Application(
            user_id=user_id,
            job_id=application_data.job_id,
            resume_id=application_data.resume_id,
            cover_letter=application_data.cover_letter,
            status="pending"
        )
        
        try:
            db.add(application)
            db.commit()
            db.refresh(application)
            return application
        except IntegrityError:
            db.rollback()
            raise ValueError("Failed to create application")

    @staticmethod
    async def get_user_applications(db: Session, user_id: int):
        """Get user applications with proper error handling"""
        try:
            return db.query(Application).filter(Application.user_id == user_id).all()
        except Exception as e:
            print(f"Error fetching user applications: {e}")
            return []

    @staticmethod
    async def get_application_by_id(db: Session, application_id: int, user_id: int):
        """Get specific application with validation"""
        try:
            return db.query(Application).filter(
                Application.id == application_id,
                Application.user_id == user_id
            ).first()
        except Exception as e:
            print(f"Error fetching application: {e}")
            return None

    
    @staticmethod
    async def get_employer_applications(db: Session, employer_id: int, filters: dict = None):
        """Get applications for all jobs posted by an employer"""
        try:
            # Get job IDs posted by this employer
            job_ids_query = db.query(Job.id).filter(Job.user_id == employer_id)
            job_ids = [job_id for (job_id,) in job_ids_query.all()]
            
            if not job_ids:
                return []
            
            query = db.query(Application).filter(Application.job_id.in_(job_ids))
            
            # Apply filters
            if filters:
                if filters.get('status'):
                    query = query.filter(Application.status == filters['status'])
                if filters.get('job_id'):
                    query = query.filter(Application.job_id == filters['job_id'])
            
            return query.order_by(Application.applied_at.desc()).all()
        except Exception as e:
            print(f"Error fetching employer applications: {e}")
            return []
    
    @staticmethod
    async def update_application_status(db: Session, application_id: int, employer_id: int, new_status: str):
        """Update application status with employer validation"""
        try:
            application = db.query(Application).join(Job).filter(
                Application.id == application_id,
                Job.user_id == employer_id
            ).first()
            
            if not application:
                raise ValueError("Application not found or access denied")
            
            valid_statuses = ["pending", "reviewed", "interviewing", "rejected", "offered", "hired"]
            if new_status not in valid_statuses:
                raise ValueError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
            
            application.status = new_status
            db.commit()
            db.refresh(application)
            return application
        except Exception as e:
            db.rollback()
            raise ValueError(str(e))