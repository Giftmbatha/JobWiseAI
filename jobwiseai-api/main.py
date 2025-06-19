from fastapi import FastAPI, UploadFile, File
from typing import List

app = FastAPI()

@app.post("/parse-resume/")
async def parse_resume(file: UploadFile = File(...)):
    # Simulate skill extraction
    return {
        "skills": ["Python", "Django", "PostgreSQL"],
        "extracted": True
    }
