from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.report_generator import ReportGenerator
from app.models.user import User
import numpy as np
from app.models.job import Job
from app.utils.dependencies import get_current_user, get_current_employer, get_current_admin
from typing import Dict, Any

router = APIRouter()

@router.get("/trends")
def get_application_trends(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employer)
) -> Dict[str, Any]:
    """Get application trends report for employers"""
    try:
        report = ReportGenerator.generate_application_trends(db, days)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@router.get("/skills")
def get_skills_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get skills demand report"""
    try:
        report = ReportGenerator.generate_skills_heatmap(db)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@router.get("/salaries")
def get_salary_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get salary distribution report"""
    try:
        report = ReportGenerator.generate_salary_distribution(db)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@router.get("/admin/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
) -> Dict[str, Any]:
    """Get admin dashboard report"""
    try:
        report = ReportGenerator.generate_admin_dashboard(db)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@router.get("/employer/overview")
def get_employer_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_employer)
) -> Dict[str, Any]:
    """Get employer-specific overview"""
    try:
        # Get employer's jobs
        employer_jobs = db.query(Job).filter(
            Job.employer_id == current_user.id,
            Job.source == "internal"
        ).all()
        
        total_jobs = len(employer_jobs)
        active_jobs = len([job for job in employer_jobs if job.is_active])
        
        # Mock applications data
        total_applications = sum(np.random.poisson(3, total_jobs))
        
        return {
            'stats': {
                'total_jobs': total_jobs,
                'active_jobs': active_jobs,
                'total_applications': total_applications,
                'average_applications': round(total_applications / max(1, total_jobs), 1),
                'company_name': current_user.company_name if hasattr(current_user, 'company_name') else "Your Company"
            },
            'recent_jobs': [job.to_dict() for job in employer_jobs[:5]]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating overview: {str(e)}")