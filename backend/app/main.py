# app/main.py - Update CORS configuration
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.config import settings
from app.database import engine, Base
from app.routers import auth
from app.routers import users
from app.routers import resumes
from app.routers import jobs
from app.routers import reports
from app.routers import applications
from app.routers import employer
from app.routers import ai_matching
from app.routers import employer_applications
from app.services.background_index import build_initial_index
import asyncio

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="JobWiseAI", version="0.1.0")

# Configure CORS - More comprehensive configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development). In production, specify allowed origins.
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers to browser
)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(resumes.router, prefix="/resumes", tags=["Resumes"])
app.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
app.include_router(applications.router, prefix="/applications", tags=["Applications"])
app.include_router(ai_matching.router, prefix="/ai", tags=["AI Matching"])
app.include_router(reports.router, prefix="/reports", tags=["Reports"])
app.include_router(employer.router, prefix="/employer", tags=["Employer"])
app.include_router(employer_applications.router, prefix="/employer/applications", tags=["Employer Applications"])

@app.get("/")
def root():
    return {"message": "Welcome to JobWiseAI API!"}

@app.get("/test-db")
def test_db_connection():
    return {"status": "Database connection endpoint"}

@app.on_event("startup")
async def startup_event():
    # Build AI index in background
    asyncio.create_task(build_initial_index())