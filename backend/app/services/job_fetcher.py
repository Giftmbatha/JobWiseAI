# app/services/job_fetcher.py
import requests
import os
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.job import Job
from app.database import get_db

class AdzunaJobFetcher:
    BASE_URL = "https://api.adzuna.com/v1/api/jobs"
    
    @staticmethod
    def fetch_and_store_jobs(
        search_term: str = "",
        location: str = "za",
        results_per_page: int = 20,
        db: Session = None
    ) -> List[Dict[str, Any]]:
        """Fetch jobs from Adzuna API and store in database"""
        app_id = os.getenv("ADZUNA_APP_ID")
        app_key = os.getenv("ADZUNA_APP_KEY")
        
        if not app_id or not app_key:
            print("Adzuna API credentials not found")
            return []
        
        try:
            url = f"{AdzunaJobFetcher.BASE_URL}/{location}/search/1"
            params = {
                "app_id": app_id,
                "app_key": app_key,
                "results_per_page": results_per_page,
                "what": search_term,
                "content-type": "application/json",
                "max_days_old": 7  # Only fetch recent jobs
            }
            
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            
            data = response.json()
            jobs_created = 0
            
            for job_data in data.get("results", []):
                # Check if job already exists in database
                existing_job = db.query(Job).filter(
                    Job.external_id == str(job_data.get("id")),
                    Job.source == "adzuna"
                ).first()
                
                if not existing_job:
                    job = Job(
                        title=job_data.get("title", ""),
                        company=job_data.get("company", {}).get("display_name", "Unknown Company"),
                        location=job_data.get("location", {}).get("display_name", "Remote"),
                        description=job_data.get("description", ""),
                        requirements=job_data.get("description", ""),
                        salary_min=job_data.get("salary_min"),
                        salary_max=job_data.get("salary_max"),
                        salary_currency=job_data.get("salary_currency", "ZAR"),
                        job_type=job_data.get("contract_type", "Full-time"),
                        remote="remote" in job_data.get("title", "").lower() or 
                              "remote" in job_data.get("description", "").lower(),
                        source="adzuna",
                        external_id=str(job_data.get("id", "")),
                        apply_url=job_data.get("redirect_url", ""),
                        company_logo=job_data.get("company", {}).get("logo", None)
                    )
                    db.add(job)
                    jobs_created += 1
            
            db.commit()
            print(f"✅ Stored {jobs_created} new jobs from Adzuna")
            return jobs_created
            
        except Exception as e:
            print(f"Error fetching jobs from Adzuna: {e}")
            return 0