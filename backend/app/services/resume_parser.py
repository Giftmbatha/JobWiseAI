# app/services/resume_parser.py
import PyPDF2
import docx
import re
from typing import Dict, List, Any
import json

class ResumeParser:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            print(f"Error reading PDF: {e}")
        return text

    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        """Extract text from DOCX file"""
        text = ""
        try:
            doc = docx.Document(file_path)
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
        except Exception as e:
            print(f"Error reading DOCX: {e}")
        return text

    @staticmethod
    def extract_skills(text: str) -> List[str]:
        """Extract skills from resume text (simple version)"""
        skills_keywords = [
            'python', 'javascript', 'java', 'c++', 'react', 'node', 'sql', 'nosql',
            'aws', 'azure', 'docker', 'kubernetes', 'machine learning', 'ai',
            'fastapi', 'django', 'flask', 'vue', 'angular', 'typescript', 'html',
            'css', 'postgresql', 'mysql', 'mongodb', 'redis', 'git', 'jenkins',
            'ci/cd', 'rest api', 'graphql', 'microservices', 'linux', 'bash'
        ]
        
        found_skills = []
        text_lower = text.lower()
        
        for skill in skills_keywords:
            if skill in text_lower:
                found_skills.append(skill.title())
        
        return list(set(found_skills))  # Remove duplicates

    @staticmethod
    def parse_resume(file_path: str, file_type: str) -> Dict[str, Any]:
        """Parse resume file and extract information"""
        if file_type == 'pdf':
            text = ResumeParser.extract_text_from_pdf(file_path)
        elif file_type in ['doc', 'docx']:
            text = ResumeParser.extract_text_from_docx(file_path)
        else:
            text = ""
        
        skills = ResumeParser.extract_skills(text)
        
        # Simple experience extraction (can be enhanced)
        experience = []
        experience_pattern = r'(\d{4}[-–]\d{4}|\w+\s+\d{4}[-–]\s*\w+\s+\d{4}|\d{4}[-–]present)'
        experience_matches = re.findall(experience_pattern, text, re.IGNORECASE)
        
        for match in experience_matches:
            experience.append({"period": match, "description": "Extracted from resume"})
        
        return {
            "parsed_text": text,
            "skills": skills,
            "experience": experience,
            "education": []  # Can be enhanced with proper education extraction
        }