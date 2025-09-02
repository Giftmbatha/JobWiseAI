# app/schemas/resume.py
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ResumeBase(BaseModel):
    filename: str
    file_type: str

class ResumeCreate(ResumeBase):
    pass

class ResumeResponse(ResumeBase):
    id: int
    user_id: int
    skills: List[Dict[str, Any]] = []
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    created_at: datetime
    
    class Config:
        orm_mode = True

class ResumeUploadResponse(BaseModel):
    success: bool
    message: str
    resume: Optional[ResumeResponse] = None