from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ApplicationBase(BaseModel):
    job_id: int
    resume_id: Optional[int] = None
    cover_letter: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    cover_letter: Optional[str] = None

class ApplicationInDBBase(ApplicationBase):
    id: int
    user_id: int
    status: str
    applied_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Make all fields optional for response flexibility
class ApplicationResponse(BaseModel):
    id: Optional[int] = None
    user_id: Optional[int] = None
    job_id: Optional[int] = None
    resume_id: Optional[int] = None
    status: Optional[str] = None
    cover_letter: Optional[str] = None
    applied_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    resume_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# For list responses
class ApplicationListResponse(BaseModel):
    applications: List[ApplicationResponse]
    total_count: int

# For detailed responses with additional data
class ApplicationDetailResponse(ApplicationResponse):
    job_details: Optional[Dict[str, Any]] = None
    resume_details: Optional[Dict[str, Any]] = None
    candidate_details: Optional[Dict[str, Any]] = None