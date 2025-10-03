from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base # Assumed to exist

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    full_name = Column(String)
    role = Column(String, default="JOB_SEEKER")
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    google_id = Column(String, unique=True, nullable=True)
    profile_pic_url = Column(String, nullable=True)

    # Job Seeker Profile Fields (Stored as String/Text in DB)
    phone = Column(String, nullable=True)
    location = Column(String, nullable=True)
    headline = Column(String, nullable=True)
    bio = Column(Text, nullable=True) # Use Text for potentially longer bios
    skills = Column(String, nullable=True) # Stored as JSON string
    experience_level = Column(String, nullable=True)
    education = Column(String, nullable=True) # Stored as JSON string

    # Employer Profile Fields
    company_name = Column(String, nullable=True)
    company_size = Column(String, nullable=True)
    company_website = Column(String, nullable=True)
    company_description = Column(Text, nullable=True) # Use Text for potentially long description

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships (Assumed to exist in other models like Resume, Job, Application)
    resumes = relationship("Resume", back_populates="user")
    jobs = relationship("Job", back_populates="employer")
    applications = relationship("Application", back_populates="user")