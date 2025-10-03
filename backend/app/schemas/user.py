from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Utility Schemas ---

class EducationEntry(BaseModel):
    """Schema for a single education entry."""
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None

# --- Base Schemas ---

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

# --- Update Schemas (Input from API) ---

class UserUpdate(BaseModel):
    # Core User fields
    full_name: Optional[str] = None
    password: Optional[str] = None # Will be hashed in router

    # Profile fields
    phone: Optional[str] = None
    location: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_level: Optional[str] = None
    education: Optional[List[EducationEntry]] = None # Use defined EducationEntry schema

class EmployerUpdate(UserUpdate):
    # Employer-specific fields
    company_name: Optional[str] = None
    company_size: Optional[str] = None
    company_website: Optional[str] = None
    company_description: Optional[str] = None

# --- Response Schemas (Output to API) ---

class UserInDB(UserBase):
    id: int
    role: str
    is_active: bool
    is_superuser: bool
    profile_pic_url: Optional[str] = None

    # Profile Fields
    phone: Optional[str] = None
    location: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None # Will be list/None after router conversion
    experience_level: Optional[str] = None
    education: Optional[List[EducationEntry]] = None # Will be list/None after router conversion

    # Employer Fields (Optional for Job Seeker)
    company_name: Optional[str] = None
    company_size: Optional[str] = None
    company_website: Optional[str] = None
    company_description: Optional[str] = None

    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    @validator('role', pre=True)
    def validate_role(cls, v):
        valid_roles = {'JOB_SEEKER', 'EMPLOYER', 'ADMIN'}
        # This validator is crucial for ensuring the returned ORM object data is valid Pydantic data
        return v if v in valid_roles else 'JOB_SEEKER'

    class Config:
        orm_mode = True
        # Allow Pydantic to accept str for fields that will be lists/dicts after conversion
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class UserResponse(UserInDB):
    # This class serves as the final response model, inherits all fields from UserInDB
    pass

class EmployerResponse(UserResponse):
    # Employer-specific response is just UserResponse with guaranteed employer fields populated
    pass

class ProfileResponse(BaseModel):
    user: UserResponse
    stats: Optional[Dict[str, Any]] = None

# --- Auth Schemas ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class EmployerCreate(UserBase):
    password: str
    company_name: Optional[str] = None
    company_size: Optional[str] = None
    company_website: Optional[str] = None
    company_description: Optional[str] = None