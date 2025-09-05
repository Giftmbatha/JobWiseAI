# app/main.py - Update CORS configuration
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.config import settings
from app.database import engine, Base
from app import models
from app.routers import auth, users, resumes, jobs, ai_matching

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="JobWiseAI", version="0.1.0")

# Configure CORS - More comprehensive configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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
app.include_router(ai_matching.router, prefix="/ai", tags=["AI Matching"])

@app.get("/")
def root():
    return {"message": "Welcome to JobWiseAI API!"}

@app.get("/test-db")
def test_db_connection():
    return {"status": "Database connection endpoint"}