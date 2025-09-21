from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi.responses import FileResponse
from datetime import datetime
import os
import uuid
import json

from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.schemas.reume import ResumeListResponse, ResumeDetailResponse, ResumeContentResponse, ResumeUploadResponse
from app.services.resume_parser import ResumeParser
from app.utils.dependencies import get_current_user

router = APIRouter()



@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Save file
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        upload_dir = "uploads/resumes"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, unique_filename)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Parse resume
        parsed_data = ResumeParser.parse_resume(file_path)
        
        # Create resume record - make sure to use file.filename for the name field
        resume = Resume(
            user_id=current_user.id,
            name=file.filename,  # This is the original filename
            file_path=file_path,
            content=parsed_data.get('content', ''),
            embeddings=None,
        )
        
        db.add(resume)
        db.commit()
        db.refresh(resume)
        
        # Return response with parsed data
        return {
            "id": resume.id,
            "user_id": resume.user_id,
            "name": resume.name,  # This provides the filename
            "file_path": resume.file_path,
            "uploaded_at": resume.uploaded_at,
            "content": resume.content,
            "embeddings": resume.embeddings,
            "skills": parsed_data.get('skills', []),
            "experience": parsed_data.get('experience', []),
            "education": parsed_data.get('education', []),
            "file_size": get_file_size(resume.file_path),
            "file_type": get_file_type(resume.file_path)
        }
        
    except Exception as e:
        # Clean up file if error occurs
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading resume: {str(e)}"
        )

@router.get("", response_model=List[ResumeListResponse])
async def get_user_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all resumes for the current user
    """
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    
    # Convert SQLAlchemy objects to dictionaries that Pydantic can validate
    resume_list = []
    for resume in resumes:
        resume_dict = {
            "id": resume.id,
            "user_id": resume.user_id,
            "name": resume.name,
            "file_path": resume.file_path,
            "uploaded_at": resume.uploaded_at,
            "file_size": get_file_size(resume.file_path) if hasattr(resume, 'file_path') else None,
            "file_type": get_file_type(resume.file_path) if hasattr(resume, 'file_path') else None
        }
        resume_list.append(resume_dict)
    
    return resume_list

@router.get("/{resume_id}", response_model=ResumeDetailResponse)
async def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific resume by ID with parsed data
    """
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Parse the resume to get skills, experience, education
    parsed_data = ResumeParser.parse_resume(resume.file_path)
    
    # Create response dictionary
    response_data = {
        "id": resume.id,
        "user_id": resume.user_id,
        "name": resume.name,
        "file_path": resume.file_path,
        "uploaded_at": resume.uploaded_at,
        "content": resume.content,
        "embeddings": resume.embeddings,
        "skills": parsed_data.get('skills', []),
        "experience": parsed_data.get('experience', []),
        "education": parsed_data.get('education', []),
        "file_size": get_file_size(resume.file_path),
        "file_type": get_file_type(resume.file_path)
    }
    
    return response_data

@router.get("/{resume_id}/content", response_model=ResumeContentResponse)
async def get_resume_content(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get only the parsed content of a resume
    """
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Parse the resume content
    parsed_data = ResumeParser.parse_resume(resume.file_path)
    
    return {
        "content": resume.content,
        "skills": parsed_data.get('skills', []),
        "experience": parsed_data.get('experience', []),
        "education": parsed_data.get('education', [])
    }

@router.get("/{resume_id}/download")
async def download_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download the original resume file
    """
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    if not os.path.exists(resume.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume file not found"
        )
    
    # Determine content type based on file extension
    file_extension = os.path.splitext(resume.file_path)[1].lower()
    media_type = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc': 'application/msword',
        '.txt': 'text/plain'
    }.get(file_extension, 'application/octet-stream')
    
    return FileResponse(
        path=resume.file_path,
        media_type=media_type,
        filename=resume.name
    )

@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a resume and its file
    """
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Delete the file if it exists
    if os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except Exception as e:
            print(f"Error deleting file: {e}")
    
    # Delete the database record
    db.delete(resume)
    db.commit()
    
    return {"message": "Resume deleted successfully"}

# Helper functions
def get_file_size(file_path: str) -> Optional[int]:
    """Get file size in bytes"""
    if os.path.exists(file_path):
        return os.path.getsize(file_path)
    return None

def get_file_type(file_path: str) -> Optional[str]:
    """Get file type from extension"""
    if os.path.exists(file_path):
        return os.path.splitext(file_path)[1].lower().lstrip('.')
    return None