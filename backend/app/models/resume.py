from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
import json

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String)
    file_path = Column(String)
    content = Column(Text)  # Parsed resume content
    embeddings = Column(Text)  # JSON string of AI embeddings
    skills_json = Column(Text, nullable=True)  # Store skills as JSON string
    experience_json = Column(Text, nullable=True)  # Store experience as JSON string
    education_json = Column(Text, nullable=True)  # Store education as JSON string
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="resumes")
    applications = relationship("Application", back_populates="resume")
    

def to_dict(self):
    # Parse JSON strings back to Python objects
    skills_data = json.loads(self.skills) if self.skills else []
    experience_data = json.loads(self.experience) if self.experience else []
    education_data = json.loads(self.education) if self.education else []
    
    return {
        "id": self.id,
        "filename": self.filename,
        "file_type": self.file_type,
        "skills": skills_data,
        "experience": experience_data,
        "education": education_data,
        "created_at": self.created_at.isoformat(),
    }