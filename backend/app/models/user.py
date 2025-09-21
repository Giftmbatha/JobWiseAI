from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    full_name = Column(String)
    role = Column(String, default="JOB_SEEKER")  # Simple string, no enum
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    google_id = Column(String, unique=True, nullable=True)
    profile_pic_url = Column(String, nullable=True)
    
    # Relationships
    resumes = relationship("Resume", back_populates="user")
    jobs = relationship("Job", back_populates="employer")
    applications = relationship("Application", back_populates="user")