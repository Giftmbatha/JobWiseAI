import numpy as np
from typing import List, Dict, Any
import json
from sentence_transformers import SentenceTransformer
import faiss
import torch

class AIMatchingService:
    def __init__(self):
        self.model = None
        self.job_index = None
        self.resume_index = None
        self.job_ids = []
        self.resume_ids = []
        
    def load_model(self):
        """Load the sentence transformer model"""
        try:
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            print("✅ AI model loaded successfully")
        except Exception as e:
            print(f"❌ Failed to load AI model: {e}")
            # Fallback to simpler matching
    
    def generate_embedding(self, text: str) -> np.ndarray:
        """Generate embedding for text"""
        if self.model is None:
            self.load_model()
        
        if text is None or text.strip() == "":
            return np.zeros(384)  # Default dimension for all-MiniLM-L6-v2
        
        embedding = self.model.encode(text)
        return embedding
    
    def create_job_index(self, jobs: List[Dict]):
        """Create FAISS index for jobs"""
        if not jobs:
            return
        
        embeddings = []
        self.job_ids = []
        
        for job in jobs:
            # Combine job details for embedding
            job_text = f"{job['title']} {job['description']} {job['requirements']} {job['company']}"
            embedding = self.generate_embedding(job_text)
            embeddings.append(embedding)
            self.job_ids.append(job['id'])
        
        if embeddings:
            embeddings = np.array(embeddings).astype('float32')
            self.job_index = faiss.IndexFlatL2(embeddings.shape[1])
            self.job_index.add(embeddings)
            print(f"✅ Created job index with {len(jobs)} jobs")
    
    def create_resume_index(self, resumes: List[Dict]):
        """Create FAISS index for resumes"""
        if not resumes:
            return
        
        embeddings = []
        self.resume_ids = []
        
        for resume in resumes:
            resume_text = resume.get('parsed_text', '') + ' ' + ' '.join(resume.get('skills', []))
            embedding = self.generate_embedding(resume_text)
            embeddings.append(embedding)
            self.resume_ids.append(resume['id'])
        
        if embeddings:
            embeddings = np.array(embeddings).astype('float32')
            self.resume_index = faiss.IndexFlatL2(embeddings.shape[1])
            self.resume_index.add(embeddings)
            print(f"✅ Created resume index with {len(resumes)} resumes")
    
    def find_matching_jobs(self, resume_text: str, skills: List[str], top_k: int = 5) -> List[Dict]:
        """Find matching jobs for a resume"""
        if self.job_index is None or not self.job_ids:
            return []
        
        # Generate embedding for resume
        query_text = resume_text + ' ' + ' '.join(skills)
        query_embedding = self.generate_embedding(query_text)
        query_embedding = np.array([query_embedding]).astype('float32')
        
        # Search for similar jobs
        distances, indices = self.job_index.search(query_embedding, top_k)
        
        matches = []
        for i, (distance, idx) in enumerate(zip(distances[0], indices[0])):
            if idx < len(self.job_ids):
                match_score = max(0, 100 - (distance * 10))  # Convert distance to percentage
                matches.append({
                    'job_id': self.job_ids[idx],
                    'score': round(min(100, match_score), 2),
                    'rank': i + 1
                })
        
        return matches
    
    def find_matching_candidates(self, job_text: str, top_k: int = 5) -> List[Dict]:
        """Find matching candidates for a job"""
        if self.resume_index is None or not self.resume_ids:
            return []
        
        # Generate embedding for job
        query_embedding = self.generate_embedding(job_text)
        query_embedding = np.array([query_embedding]).astype('float32')
        
        # Search for similar resumes
        distances, indices = self.resume_index.search(query_embedding, top_k)
        
        matches = []
        for i, (distance, idx) in enumerate(zip(distances[0], indices[0])):
            if idx < len(self.resume_ids):
                match_score = max(0, 100 - (distance * 10))
                matches.append({
                    'resume_id': self.resume_ids[idx],
                    'score': round(min(100, match_score), 2),
                    'rank': i + 1
                })
        
        return matches

# Global instance
ai_matcher = AIMatchingService()