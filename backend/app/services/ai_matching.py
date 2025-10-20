import numpy as np
from typing import List, Dict, Any, Optional
import json
from sentence_transformers import SentenceTransformer
import faiss
import re
from datetime import datetime, timedelta
from sqlalchemy.orm import session
from app.models.job import Job
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global instance with lazy loading
ai_matcher = None

class AIMatchingService:
    def __init__(self):
        self.model = None
        self.job_index = None
        self.resume_index = None
        self.job_ids = []
        self.job_data = {}
        self.resume_ids = []
        self.resume_data = {}
        self.last_update = None
        
    def load_model(self):
        """Load the sentence transformer model"""
        try:
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("AI model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load AI model: {e}")
            raise
    
    def generate_embedding(self, text: str) -> np.ndarray:
        """Generate embedding for text"""
        if self.model is None:
            self.load_model()
        
        if not text or text.strip() == "":
            return np.zeros(384)  # Default dimension for all-MiniLM-L6-v2
        
        try:
            embedding = self.model.encode(text, convert_to_tensor=False, normalize_embeddings=True)
            return embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return np.zeros(384)
    
    def create_job_index(self, jobs: List[Dict]):
        """Create FAISS index for jobs"""
        if not jobs:
            logger.warning("No jobs provided for indexing")
            return
        
        embeddings = []
        self.job_ids = []
        self.job_data = {}
        
        for job in jobs:
            try:
                job_text = self._prepare_job_text(job)
                embedding = self.generate_embedding(job_text)
                
                embeddings.append(embedding)
                self.job_ids.append(job['id'])
                self.job_data[job['id']] = job
                
            except Exception as e:
                logger.error(f"Error processing job {job.get('id', 'unknown')}: {e}")
                continue
        
        if embeddings:
            try:
                embeddings = np.array(embeddings).astype('float32')
                self.job_index = faiss.IndexFlatIP(embeddings.shape[1])  # Use Inner Product for cosine similarity
                faiss.normalize_L2(embeddings)  # Normalize for cosine similarity
                self.job_index.add(embeddings)
                self.last_update = datetime.now()
                logger.info(f"Created job index with {len(embeddings)} jobs")
            except Exception as e:
                logger.error(f"Error creating job index: {e}")
                self.job_index = None
    
    def _prepare_job_text(self, job: Dict) -> str:
        """Prepare text for embedding generation from job data"""
        text_parts = []
        
        # Basic job information
        text_parts.append(job.get('title', ''))
        text_parts.append(job.get('company', ''))
        text_parts.append(job.get('location', ''))
        text_parts.append(job.get('job_type', ''))
        
        # Handle different job structures
        description = job.get('description', '') or job.get('summary', '') or job.get('snippet', '')
        text_parts.append(description)
        
        requirements = job.get('requirements', '') or job.get('qualifications', '') or job.get('skills', '')
        if isinstance(requirements, list):
            requirements = ' '.join(requirements)
        text_parts.append(requirements)
        
        # Clean and combine text
        clean_text = ' '.join([str(part) for part in text_parts if part])
        return clean_text.lower().strip()
    
    def create_resume_index(self, resumes: List[Dict]):
        """Create FAISS index for resumes"""
        if not resumes:
            logger.warning("No resumes provided for indexing")
            return
        
        embeddings = []
        self.resume_ids = []
        self.resume_data = {}
        
        for resume in resumes:
            try:
                resume_text = self._prepare_resume_text(resume)
                embedding = self.generate_embedding(resume_text)
                
                embeddings.append(embedding)
                self.resume_ids.append(resume['id'])
                self.resume_data[resume['id']] = resume
                
            except Exception as e:
                logger.error(f"Error processing resume {resume.get('id', 'unknown')}: {e}")
                continue
        
        if embeddings:
            try:
                embeddings = np.array(embeddings).astype('float32')
                self.resume_index = faiss.IndexFlatIP(embeddings.shape[1])
                faiss.normalize_L2(embeddings)
                self.resume_index.add(embeddings)
                logger.info(f"Created resume index with {len(embeddings)} resumes")
            except Exception as e:
                logger.error(f"Error creating resume index: {e}")
                self.resume_index = None
    
    def _prepare_resume_text(self, resume: Dict) -> str:
        """Prepare text for embedding generation from resume data"""
        text_parts = []
        
        # Content and skills
        text_parts.append(resume.get('content', ''))
        
        # Skills
        skills = resume.get('skills', [])
        if isinstance(skills, str):
            try:
                skills = json.loads(skills) if skills.startswith('[') else [s.strip() for s in skills.split(',')]
            except:
                skills = [skills]
        text_parts.extend(skills if isinstance(skills, list) else [skills])
        
        # Experience
        experience = resume.get('experience', [])
        if isinstance(experience, str):
            try:
                experience = json.loads(experience)
            except:
                experience = []
        
        for exp in experience[:3]:
            text_parts.append(exp.get('title', ''))
            text_parts.append(exp.get('company', ''))
            text_parts.append(exp.get('description', ''))
        
        # Education
        education = resume.get('education', [])
        if isinstance(education, str):
            try:
                education = json.loads(education)
            except:
                education = []
        
        for edu in education:
            text_parts.append(edu.get('degree', ''))
            text_parts.append(edu.get('institution', ''))
        
        # Clean and combine text
        clean_text = ' '.join([str(part) for part in text_parts if part])
        return clean_text.lower().strip()
    
    def find_matching_jobs(self, resume_data: Dict, top_k: int = 10, include_external: bool = True) -> List[Dict]:
        """Find matching jobs for a resume"""
        if self.job_index is None or not self.job_ids:
            logger.warning("Job index not available")
            return []
        
        try:
            # Generate embedding for resume
            query_text = self._prepare_resume_text(resume_data)
            query_embedding = self.generate_embedding(query_text)
            query_embedding = np.array([query_embedding]).astype('float32')
            faiss.normalize_L2(query_embedding)  # Normalize for cosine similarity
            
            # Search for similar jobs
            search_k = min(top_k * 2, len(self.job_ids))
            similarities, indices = self.job_index.search(query_embedding, search_k)
            
            matches = []
            seen_jobs = set()
            
            for i, (similarity, idx) in enumerate(zip(similarities[0], indices[0])):
                if idx < len(self.job_ids) and idx >= 0:
                    job_id = self.job_ids[idx]
                    
                    if job_id in seen_jobs:
                        continue
                    
                    job = self.job_data.get(job_id)
                    if not job:
                        continue
                    
                    # Filter external jobs if needed
                    if not include_external and job.get('is_external', False):
                        continue
                    
                    # Convert similarity to percentage (cosine similarity is between -1 and 1)
                    match_score = max(0, min(100, (similarity + 1) * 50))  # Convert to 0-100 scale
                    match_score = round(match_score, 2)
                    
                    matches.append({
                        'job': job,
                        'score': match_score,
                        'rank': len(matches) + 1
                    })
                    
                    seen_jobs.add(job_id)
                    
                    if len(matches) >= top_k:
                        break
            
            # Sort by score descending
            matches.sort(key=lambda x: x['score'], reverse=True)
            return matches
            
        except Exception as e:
            logger.error(f"Error finding matching jobs: {e}")
            return []
    
    def find_candidates_for_job(self, job_data: Dict, top_k: int = 10, min_score: float = 50.0) -> List[Dict]:
        """Find matching candidates for a specific job posting"""
        if self.resume_index is None or not self.resume_ids:
            logger.warning("Resume index not available")
            return []
        
        try:
            # Generate embedding for job
            query_text = self._prepare_job_text(job_data)
            query_embedding = self.generate_embedding(query_text)
            query_embedding = np.array([query_embedding]).astype('float32')
            faiss.normalize_L2(query_embedding)  # Normalize for cosine similarity
            
            # Search for similar resumes
            search_k = min(top_k * 3, len(self.resume_ids))
            similarities, indices = self.resume_index.search(query_embedding, search_k)
            
            matches = []
            seen_candidates = set()
            
            for i, (similarity, idx) in enumerate(zip(similarities[0], indices[0])):
                if idx < len(self.resume_ids) and idx >= 0:
                    resume_id = self.resume_ids[idx]
                    
                    # Skip duplicates
                    if resume_id in seen_candidates:
                        continue
                    
                    resume = self.resume_data.get(resume_id)
                    if not resume:
                        continue
                    
                    # Calculate match score (0-100)
                    match_score = max(0, min(100, (similarity + 1) * 50))  # Convert to 0-100 scale
                    match_score = round(match_score, 2)
                    
                    # Apply minimum score filter
                    if match_score >= min_score:
                        matches.append({
                            'resume': resume,
                            'score': match_score,
                            'rank': len(matches) + 1,
                            'distance': float(1 - similarity),  # Convert to distance
                            'relevance': self._calculate_relevance(resume, job_data)
                        })
                    
                    seen_candidates.add(resume_id)
                    
                    # Stop when we have enough matches
                    if len(matches) >= top_k:
                        break
            
            # Sort by score descending
            matches.sort(key=lambda x: x['score'], reverse=True)
            return matches
            
        except Exception as e:
            logger.error(f"Error finding candidates for job: {e}")
            return []
    
    def _calculate_relevance(self, resume: Dict, job: Dict) -> Dict[str, Any]:
        """Calculate detailed relevance metrics between resume and job"""
        resume_skills = set()
        job_skills = set()
        
        # Extract skills from resume
        skills = resume.get('skills', [])
        if isinstance(skills, str):
            try:
                skills = json.loads(skills) if skills.startswith('[') else skills.split(',')
            except:
                skills = [skills]
        
        resume_skills.update([str(s).lower().strip() for s in skills if s])
        
        # Extract skills from job description
        job_desc = (job.get('description', '') + ' ' + job.get('requirements', '')).lower()
        job_skills.update(self._extract_skills_from_text(job_desc))
        
        # Calculate skill match
        matching_skills = resume_skills.intersection(job_skills)
        skill_match_percentage = (len(matching_skills) / len(job_skills)) * 100 if job_skills else 0
        
        return {
            'matching_skills': list(matching_skills),
            'skill_match_percentage': round(skill_match_percentage, 2),
            'total_skills_matched': len(matching_skills),
            'resume_skills_count': len(resume_skills),
            'job_skills_count': len(job_skills)
        }
    
    def _extract_skills_from_text(self, text: str) -> set:
        """Extract skills from text using common patterns"""
        skills = set()
        
        # Simple extraction: look for comma-separated skills
        for part in re.split(r'[,\n]', text):
            skill = part.strip().lower()
            if 2 < len(skill) < 50 and re.match(r'^[a-zA-Z0-9\-\+\#\. ]+$', skill):
                skills.add(skill)
        
        return skills
    
    def get_job_recommendations(self, user_id: int, resume_data: Dict, top_k: int = 10, 
                               include_external: bool = True, min_score: float = 50.0) -> List[Dict]:
        """Get job recommendations for a user with filtering"""
        matches = self.find_matching_jobs(resume_data, top_k * 2, include_external)
        
        # Apply filters
        filtered_matches = [
            match for match in matches 
            if match['score'] >= min_score
        ]
        
        return filtered_matches[:top_k]
    
    def get_candidate_recommendations(self, job_id: str, job_data: Dict, top_k: int = 10, 
                                    min_score: float = 50.0) -> List[Dict]:
        """Get candidate recommendations for a job posting"""
        return self.find_candidates_for_job(job_data, top_k, min_score)
    
    def batch_candidate_matching(self, jobs: List[Dict], top_k_per_job: int = 5) -> Dict[str, List[Dict]]:
        """Find candidates for multiple jobs simultaneously"""
        results = {}
        
        for job in jobs:
            job_id = job.get('id')
            if job_id:
                candidates = self.find_candidates_for_job(job, top_k_per_job)
                results[job_id] = candidates
        
        return results
    
    def should_rebuild_index(self, max_age_minutes: int = 30) -> bool:
        """Check if index should be rebuilt due to age"""
        if self.last_update is None:
            return True
        
        age = datetime.now() - self.last_update
        return age > timedelta(minutes=max_age_minutes)
    
 
    
    def build_job_index_from_db(self, db: session, include_external: bool = True):
        """Build job index from database jobs"""
        try:
            # Query jobs from database
            query = db.query(Job)
            if not include_external:
                query = query.filter(Job.is_external == False)
            
            jobs = query.all()
            
            # Convert to dict format for indexing
            job_dicts = []
            for job in jobs:
                job_dict = job.to_dict()
                job_dict['is_external'] = job.is_external
                job_dicts.append(job_dict)
            
            # Create the index
            self.create_job_index(job_dicts)
            logger.info(f"Built job index with {len(job_dicts)} jobs from database")
            
        except Exception as e:
            logger.error(f"Error building job index from database: {e}")
            raise

    def ensure_job_index_loaded(self, db, include_external: bool = True):
        """Ensure job index is loaded, rebuild if necessary"""
        if (self.job_index is None or 
            not self.job_ids or 
            self.should_rebuild_index()):
            logger.info("Job index needs to be built or rebuilt")
            self.build_job_index_from_db(db, include_external)

def get_ai_matcher() -> AIMatchingService:
    """Get or create the AI matching service instance"""
    global ai_matcher
    if ai_matcher is None:
        ai_matcher = AIMatchingService()
        try:
            ai_matcher.load_model()
        except Exception as e:
            logger.error(f"Failed to initialize AI matcher: {e}")
            # Still return instance but it won't have model loaded
    return ai_matcher

