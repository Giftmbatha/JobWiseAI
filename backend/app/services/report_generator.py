import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any
import io
import base64
from sqlalchemy.orm import Session
from app.models.job import Job
from app.models.resume import Resume
from app.models.user import User

class ReportGenerator:
    @staticmethod
    def generate_application_trends(db: Session, days: int = 30) -> Dict:
        """Generate application trends report"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Mock data - in real app, you'd query actual application data
        dates = [start_date + timedelta(days=i) for i in range(days)]
        applications = np.random.poisson(15, days).cumsum()
        
        plt.figure(figsize=(10, 6))
        plt.plot(dates, applications, marker='o', linewidth=2, color='#1D503A')
        plt.title('Job Applications Trend (Last 30 Days)', fontsize=14, fontweight='bold')
        plt.xlabel('Date')
        plt.ylabel('Total Applications')
        plt.grid(True, alpha=0.3)
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        # Save to buffer
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=100)
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return {
            'chart': f"data:image/png;base64,{image_base64}",
            'total_applications': int(applications[-1]),
            'average_daily': round(applications[-1] / days, 1),
            'time_period': f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}"
        }

    @staticmethod
    def generate_skills_heatmap(db: Session) -> Dict:
        """Generate skills demand heatmap"""
        # Get top skills from jobs
        jobs = db.query(Job).filter(Job.source == "internal").all()
        
        skills_counter = {}
        for job in jobs:
            if job.requirements:
                # Simple keyword extraction - in real app, use NLP
                skills = [
                    'python', 'javascript', 'react', 'node', 'sql', 'aws',
                    'docker', 'kubernetes', 'machine learning', 'ai',
                    'fastapi', 'django', 'flask', 'vue', 'angular'
                ]
                for skill in skills:
                    if skill in job.requirements.lower():
                        skills_counter[skill] = skills_counter.get(skill, 0) + 1
        
        # Prepare data for chart
        skills = list(skills_counter.keys())
        counts = list(skills_counter.values())
        
        plt.figure(figsize=(12, 8))
        colors = plt.cm.Greens(np.linspace(0.4, 0.8, len(skills)))
        bars = plt.barh(skills, counts, color=colors)
        
        plt.title('Most In-Demand Skills', fontsize=16, fontweight='bold')
        plt.xlabel('Number of Job Postings')
        plt.grid(True, alpha=0.3, axis='x')
        
        # Add value labels
        for bar in bars:
            width = bar.get_width()
            plt.text(width + 0.3, bar.get_y() + bar.get_height()/2, 
                    f'{int(width)}', ha='left', va='center')
        
        plt.tight_layout()
        
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=100)
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return {
            'chart': f"data:image/png;base64,{image_base64}",
            'top_skills': dict(sorted(skills_counter.items(), key=lambda x: x[1], reverse=True)[:10])
        }

    @staticmethod
    def generate_salary_distribution(db: Session) -> Dict:
        """Generate salary distribution report"""
        jobs = db.query(Job).filter(
            Job.salary_min.isnot(None),
            Job.salary_max.isnot(None),
            Job.source == "internal"
        ).all()
        
        if not jobs:
            return {'chart': None, 'message': 'No salary data available'}
        
        # Calculate midpoints
        midpoints = [(job.salary_min + job.salary_max) / 2 for job in jobs]
        
        plt.figure(figsize=(10, 6))
        n, bins, patches = plt.hist(midpoints, bins=15, alpha=0.7, color='#1D503A', edgecolor='black')
        
        plt.title('Salary Distribution', fontsize=14, fontweight='bold')
        plt.xlabel('Salary (ZAR)')
        plt.ylabel('Number of Jobs')
        plt.grid(True, alpha=0.3)
        
        # Format x-axis as currency
        plt.gca().xaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'R{x:,.0f}'))
        
        plt.tight_layout()
        
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=100)
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return {
            'chart': f"data:image/png;base64,{image_base64}",
            'average_salary': round(np.mean(midpoints), 2),
            'min_salary': min(midpoints),
            'max_salary': max(midpoints),
            'total_jobs': len(jobs)
        }

    @staticmethod
    def generate_admin_dashboard(db: Session) -> Dict:
        """Generate admin dashboard report"""
        total_users = db.query(User).count()
        total_jobs = db.query(Job).count()
        total_resumes = db.query(Resume).count()
        
        # User growth (mock data)
        dates = [datetime.utcnow() - timedelta(days=i) for i in range(30, 0, -1)]
        user_counts = np.random.poisson(5, 30).cumsum() + total_users - 30
        
        plt.figure(figsize=(12, 8))
        
        # Create subplots
        plt.subplot(2, 2, 1)
        sizes = [total_users, total_jobs, total_resumes]
        labels = ['Users', 'Jobs', 'Resumes']
        colors = ['#1D503A', '#2D6B52', '#3E7A5F']
        plt.pie(sizes, labels=labels, colors=colors, autopct='%1.1f%%', startangle=90)
        plt.title('Platform Overview')
        
        plt.subplot(2, 2, 2)
        plt.plot(dates, user_counts, marker='o', color='#1D503A', linewidth=2)
        plt.title('User Growth Trend')
        plt.xticks(rotation=45)
        plt.grid(True, alpha=0.3)
        
        plt.subplot(2, 2, 3)
        job_sources = db.query(Job.source, db.func.count(Job.id)).group_by(Job.source).all()
        sources = [source[0] for source in job_sources]
        counts = [source[1] for source in job_sources]
        plt.bar(sources, counts, color=['#1D503A', '#2D6B52'])
        plt.title('Jobs by Source')
        
        plt.subplot(2, 2, 4)
        resume_counts = db.query(Resume).count()
        user_with_resume = db.query(User).join(Resume).distinct().count()
        plt.bar(['With Resume', 'Without Resume'], [user_with_resume, total_users - user_with_resume], 
                color=['#1D503A', '#cccccc'])
        plt.title('User Resume Uploads')
        
        plt.tight_layout()
        
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=100)
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return {
            'chart': f"data:image/png;base64,{image_base64}",
            'stats': {
                'total_users': total_users,
                'total_jobs': total_jobs,
                'total_resumes': total_resumes,
                'active_jobs': db.query(Job).filter(Job.source == "internal").count(),
                'employers': db.query(User).filter(User.role == "EMPLOYER").count(),
                'job_seekers': db.query(User).filter(User.role == "JOB_SEEKER").count()
            }
        }