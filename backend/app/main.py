# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app import models
from app.routers import auth, users

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="JobWiseAI", version="0.1.0")

# Configure CORS - More permissive for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", 
                   "http://127.0.0.1:3000",
                    "http://localhost:8000",
                    "http://127.0.0.1:8000"],# Explicit origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Include Routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])

@app.get("/")
def root():
    return {"message": "Welcome to JobWiseAI API!"}

@app.get("/test-db")
def test_db_connection():
    return {"status": "Database test endpoint - add your DB test logic here"}