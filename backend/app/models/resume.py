# app/models/resume.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
import json

class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    file_path = Column(String)
    file_type = Column(String)  # pdf, doc, docx
    parsed_text = Column(Text)
    skills = Column(Text)  # JSON string of extracted skills
    experience = Column(Text)  # JSON string of experience
    education = Column(Text)  # JSON string of education
    embeddings = Column(Text)  # JSON string of AI embeddings
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("User", back_populates="resumes")
    
    def to_dict(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "file_type": self.file_type,
            "skills": json.loads(self.skills) if self.skills else [],
            "experience": json.loads(self.experience) if self.experience else [],
            "education": json.loads(self.education) if self.education else [],
            "created_at": self.created_at.isoformat(),
        }