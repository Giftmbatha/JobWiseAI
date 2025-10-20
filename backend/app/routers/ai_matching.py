from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.models.resume import Resume
from app.services.ai_matching import get_ai_matcher
from app.utils.dependencies import get_current_user

router = APIRouter()

class RecommendationRequest(BaseModel):
    include_external: Optional[bool] = True
    limit: Optional[int] = 10
    min_score: Optional[float] = 50.0

class RecommendationResponse(BaseModel):
    user_id: int
    recommendations: List[dict]

@router.get("/recommendations", response_model=RecommendationResponse)
async def get_ai_recommendations(
    include_external: bool = True,
    limit: int = 10,
    min_score: float = 50.0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get AI-powered job recommendations for the current user
    """
    try:
        user_id = current_user.id
        
        # Fetch user's latest resume
        resume = db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.uploaded_at.desc()).first()
        if not resume or not resume.content:
            raise HTTPException(status_code=404, detail="No valid resume found for the user")
        
        resume_data = {
            'id': resume.id,
            'user_id': resume.user_id,
            'content': resume.content,
            'skills': resume.skills_json or [],
            'experience': resume.experience_json or [],
            'education': resume.education_json or [],
            'uploaded_at': resume.uploaded_at.isoformat() if resume.uploaded_at else None
        }
        
        matcher = get_ai_matcher()
        
        # ✅ CRITICAL FIX: Ensure job index is loaded before getting recommendations
        matcher.ensure_job_index_loaded(db, include_external)
        
        recommendations = matcher.get_job_recommendations(
            user_id=user_id,
            resume_data=resume_data,
            top_k=limit,
            include_external=include_external,
            min_score=min_score
        )
        
        return {
            "user_id": user_id,
            "recommendations": recommendations
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in AI recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")

@router.get("/recommendations/{user_id}", response_model=RecommendationResponse)
async def get_ai_recommendations_for_user(
    user_id: int,
    include_external: bool = True,
    limit: int = 10,
    min_score: float = 50.0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get AI-powered job recommendations for a specific user (admin/employer access)
    """
    # Add permission check
    if current_user.role not in ['ADMIN', 'EMPLOYER'] and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # Fetch user's latest resume
        resume = db.query(Resume).filter(Resume.user_id == user_id).order_by(Resume.uploaded_at.desc()).first()
        if not resume or not resume.content:
            raise HTTPException(status_code=404, detail="No valid resume found for the user")
        
        resume_data = {
            'id': resume.id,
            'user_id': resume.user_id,
            'content': resume.content,
            'skills': resume.skills_json or [],
            'experience': resume.experience_json or [],
            'education': resume.education_json or [],
            'uploaded_at': resume.uploaded_at.isoformat() if resume.uploaded_at else None
        }
        
        matcher = get_ai_matcher()
        recommendations = matcher.get_job_recommendations(
            user_id=user_id,
            resume_data=resume_data,
            top_k=limit,
            include_external=include_external,
            min_score=min_score
        )
        
        return {
            "user_id": user_id,
            "recommendations": recommendations
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in AI recommendations for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")

@router.post("/match/jobs-for-resume/{resume_id}", response_model=dict)
async def get_ai_recommendations_for_resume(
    resume_id: int,
    request: RecommendationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get AI-powered job recommendations based on a specific resume
    """
    try:
        # Fetch the specified resume
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume or not resume.content:
            raise HTTPException(status_code=404, detail="No valid resume found with the given ID")
        
        # Permission check
        if current_user.role not in ['ADMIN', 'EMPLOYER'] and current_user.id != resume.user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        resume_data = {
            'id': resume.id,
            'user_id': resume.user_id,
            'content': resume.content,
            'skills': resume.skills_json or [],
            'experience': resume.experience_json or [],
            'education': resume.education_json or [],
            'uploaded_at': resume.uploaded_at.isoformat() if resume.uploaded_at else None
        }
        
        matcher = get_ai_matcher()
        recommendations = matcher.get_job_recommendations(
            user_id=resume.user_id,
            resume_data=resume_data,
            top_k=request.limit,
            include_external=request.include_external,
            min_score=request.min_score
        )
        
        return {
            "resume_id": resume_id,
            "user_id": resume.user_id,
            "recommendations": recommendations
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in AI recommendations for resume {resume_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")

@router.get("/health")
async def ai_health_check():
    """
    Check if AI services are healthy
    """
    try:
        matcher = get_ai_matcher()
        return {
            "status": "healthy",
            "model_loaded": matcher.model is not None,
            "service_ready": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service unhealthy: {str(e)}")