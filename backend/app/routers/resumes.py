# app/routers/resumes.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from typing import List
from app.models.resume import Resume
from app.models.user import User
from app.schemas.reume import ResumeResponse, ResumeUploadResponse
from app.services.resume_parser import ResumeParser
from app.utils.dependencies import get_current_user
import os
import uuid
from datetime import datetime
import json

router = APIRouter()

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads/resumes"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Validate file type
        allowed_types = ['pdf', 'doc', 'docx']
        file_extension = file.filename.split('.')[-1].lower() if file.filename else ''
        
        if file_extension not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File type not supported. Please upload PDF, DOC, or DOCX."
            )
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Parse resume
        parser = ResumeParser()
        parsed_data = parser.parse_resume(file_path, file_extension)
        
        # Create resume record
        resume = Resume(
            user_id=current_user.id,
            filename=file.filename,
            file_path=file_path,
            file_type=file_extension,
            parsed_text=parsed_data["parsed_text"],
            skills=json.dumps(parsed_data["skills"]),
            experience=json.dumps(parsed_data["experience"]),
            education=json.dumps(parsed_data["education"])
        )
        
        db.add(resume)
        db.commit()
        db.refresh(resume)
        
        return ResumeUploadResponse(
            success=True,
            message="Resume uploaded and parsed successfully",
            resume=resume
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading resume: {str(e)}"
        )

@router.get("/", response_model=List[ResumeResponse])
def get_user_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    return resumes

@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Delete file from filesystem
    if os.path.exists(resume.file_path):
        os.remove(resume.file_path)
    
    db.delete(resume)
    db.commit()
    
    return {"message": "Resume deleted successfully"}