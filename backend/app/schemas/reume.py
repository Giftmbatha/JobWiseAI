from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime

class ResumeBase(BaseModel):
    name: str  # This should be the original filename
    file_path: str

class ResumeCreate(ResumeBase):
    content: Optional[str] = None
    embeddings: Optional[str] = None

# For list response (basic info)
class ResumeListResponse(BaseModel):
    id: int
    user_id: int
    name: str  # This is the filename
    file_path: str
    uploaded_at: datetime
    file_size: Optional[int] = None
    file_type: Optional[str] = None
    
    class Config:
        from_attributes = True

# For detailed response with parsed data
class ResumeDetailResponse(ResumeListResponse):
    content: Optional[str] = None
    embeddings: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    experience: List[Dict[str, Any]] = Field(default_factory=list)
    education: List[Dict[str, Any]] = Field(default_factory=list)

# For upload response
class ResumeUploadResponse(ResumeDetailResponse):
    # This inherits all fields from ResumeDetailResponse
    pass

# For content-only response
class ResumeContentResponse(BaseModel):
    content: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    experience: List[Dict[str, Any]] = Field(default_factory=list)
    education: List[Dict[str, Any]] = Field(default_factory=list)