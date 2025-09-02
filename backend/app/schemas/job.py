# app/schemas/job.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class JobBase(BaseModel):
    title: str
    company: str
    location: str
    description: str
    requirements: str
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "USD"
    job_type: str
    remote: bool = False
    apply_url: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    source: str
    company_logo: Optional[str] = None
    created_at: datetime
    
    class Config:
        orm_mode = True

class JobListResponse(BaseModel):
    jobs: List[JobResponse]
    total_count: int
    page: int
    page_size: int