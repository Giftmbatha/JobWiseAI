# app/models/job.py
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import json

class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    company = Column(String, index=True)
    location = Column(String)
    description = Column(Text)
    requirements = Column(Text)
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    salary_currency = Column(String, default="USD")
    job_type = Column(String)  # Full-time, Part-time, Contract, Internship
    remote = Column(Boolean, default=False)
    source = Column(String, default="internal")  # 'internal', 'external', 'adzuna'
    external_id = Column(String, nullable=True)
    apply_url = Column(String, nullable=True)
    company_logo = Column(String, nullable=True)
    embeddings = Column(Text)  # JSON string of AI embeddings
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "company": self.company,
            "location": self.location,
            "description": self.description,
            "requirements": self.requirements,
            "salary_min": self.salary_min,
            "salary_max": self.salary_max,
            "salary_currency": self.salary_currency,
            "job_type": self.job_type,
            "remote": self.remote,
            "source": self.source,
            "apply_url": self.apply_url,
            "company_logo": self.company_logo,
            "created_at": self.created_at.isoformat(),
        }
        
    
    # Add employer relationship
    employer_id = Column(Integer, ForeignKey("users.id"))
    employer = relationship("User", back_populates="jobs")