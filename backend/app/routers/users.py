from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db # Assumed to exist
from app.models.user import User
from app.schemas.user import UserResponse, EmployerUpdate, ProfileResponse
from app.utils.dependencies import get_current_user # Assumed to exist
from app.utils.auth import get_password_hash # Assumed to exist
from typing import Optional, Any, Dict, List
from datetime import datetime
import shutil
import os
import uuid
import json

router = APIRouter()

# Configure upload directory
UPLOAD_DIR = "uploads/avatars"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- JSON Conversion Helpers ---

def _safe_json_load(data: Optional[str]) -> Any:
    """Safely converts a JSON string from the DB back into a Python object."""
    if data is None:
        return None
    try:
        # Pydantic education fields expect list of dicts, skills expects list of str
        return json.loads(data)
    except (json.JSONDecodeError, TypeError):
        # Handle cases where data might be a simple string instead of JSON
        return data


def _safe_json_dump(data: Any) -> Optional[str]:
    """Safely converts a Python object into a JSON string for DB storage."""
    if data is None:
        return None
    try:
        # Check if it's already a string (which might happen if passed from frontend as pre-stringified)
        if isinstance(data, str):
            # Attempt to parse it to ensure it's not already a stringified JSON before dumping
            json.loads(data)
            return data # Already a valid JSON string
        
        # If it's a list/dict, dump it
        if isinstance(data, (list, dict)):
            return json.dumps(data)
        
        # If it's something else, return None or raise error
        return None 
    except (json.JSONDecodeError, TypeError):
        # If it fails to load as JSON string, we dump it
        if isinstance(data, (list, dict)):
            return json.dumps(data)
        return None


# --- Profile Update Endpoint ---

@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    # Use EmployerUpdate to encompass all possible profile fields (job seeker and employer)
    user_data: EmployerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update user profile. Accepts both job seeker and employer fields.
    Updates are only applied if the user has the corresponding role.
    """
    try:
        print(f"Updating profile for user: {current_user.email} (Role: {current_user.role})")

        # Convert Pydantic model to dict, excluding fields that weren't sent
        update_data = user_data.dict(exclude_unset=True)
        
        # 1. Handle password update
        if 'password' in update_data and update_data['password']:
            if update_data['password'].strip():
                update_data['hashed_password'] = get_password_hash(update_data['password'])
            del update_data['password']
        
        # 2. Handle complex fields (skills, education) - Convert list/dict to JSON string for DB
        if 'skills' in update_data:
            update_data['skills'] = _safe_json_dump(update_data['skills'])
            
        if 'education' in update_data:
            # Pydantic validates this as List[EducationEntry], so it's a list of dicts here
            update_data['education'] = _safe_json_dump(update_data['education'])

        # 3. Apply updates to the User object
        fields_to_update = {}
        for field, value in update_data.items():
            
            # Skip employer fields for job seekers
            if current_user.role == "JOB_SEEKER" and field.startswith("company_"):
                continue

            # Skip job seeker fields for pure employer profile updates (optional, keeping flexible)
            # if current_user.role == "EMPLOYER" and field in ["skills", "education", "experience_level"]:
            #     continue # Keeping these for now as an employer might still have a personal profile
            
            if hasattr(current_user, field):
                fields_to_update[field] = value
        
        # 4. Commit changes
        # Use update method for efficiency, although setattr loop is acceptable too.
        for field, value in fields_to_update.items():
             setattr(current_user, field, value)

        # Update timestamp (though SQLAlchemy handles onupdate, explicit setting can ensure consistency)
        # current_user.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(current_user)
        
        # 5. Prepare user object for Pydantic response (converting JSON strings back to Python objects)
        current_user.skills = _safe_json_load(current_user.skills)
        current_user.education = _safe_json_load(current_user.education)
        
        print(f"Profile updated successfully for: {current_user.email}")
        
        return current_user
        
    except Exception as e:
        db.rollback()
        print(f"Error updating profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to update profile: {str(e)}"
        )


# --- Get Profile Endpoint ---

@router.get("/profile/me", response_model=ProfileResponse)
async def get_current_user_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user profile with stats"""
    try:
        # 1. Prepare user data for Pydantic response (converting JSON strings to Python objects)
        user_data = current_user
        
        user_data.skills = _safe_json_load(user_data.skills)
        user_data.education = _safe_json_load(user_data.education)
        
        # 2. Prepare stats based on user role (Relies on lazy loading or relationships being available)
        stats: Dict[str, Any] = {}
        
        if user_data.role == "JOB_SEEKER":
            stats = {
                # Note: These access database relationships and might trigger queries
                "applications_count": len(user_data.applications), 
                "resumes_count": len(user_data.resumes),
                "saved_jobs_count": 0 # Placeholder for non-modeled relationship
            }
        elif user_data.role == "EMPLOYER":
            stats = {
                "jobs_posted": len(user_data.jobs),
                # Sum applications across all posted jobs
                "total_applications": sum(len(job.applications) for job in user_data.jobs if hasattr(job, 'applications')), 
                "active_jobs": len([job for job in user_data.jobs if hasattr(job, 'is_active') and job.is_active])
            }
        
        # 3. Return final ProfileResponse
        return ProfileResponse(user=user_data, stats=stats)
        
    except Exception as e:
        print(f"Error getting profile: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get profile")

# --- Avatar Upload Endpoint ---

@router.post("/avatar", response_model=UserResponse)
async def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload or update profile picture"""
    try:
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save the uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Update user's profile_pic_url
        current_user.profile_pic_url = f"/{file_path}"
        # current_user.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(current_user)
        
        # Convert JSON strings back to lists for response
        current_user.skills = _safe_json_load(current_user.skills)
        current_user.education = _safe_json_load(current_user.education)
        
        return current_user
        
    except Exception as e:
        db.rollback()
        print(f"Error uploading profile picture: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to upload profile picture: {str(e)}"
        )