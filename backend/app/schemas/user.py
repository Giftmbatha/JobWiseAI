# app/schemas/user.py - Remove enum and use simple strings
from pydantic import BaseModel, EmailStr, validator
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class EmployerCreate(UserCreate):
    company_name: str
    company_size: Optional[str] = None
    company_website: Optional[str] = None

class UserInDB(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    role: str  # Simple string, no enum

    @validator('role')
    def validate_role(cls, v):
        # Ensure the role is one of the valid values
        valid_roles = {'JOB_SEEKER', 'EMPLOYER', 'ADMIN'}
        return v if v in valid_roles else 'JOB_SEEKER'

    class Config:
        orm_mode = True

class UserResponse(UserInDB):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None    


class EmployerResponse(UserResponse):
    company_name: Optional[str] = None
    company_size: Optional[str] = None
    company_website: Optional[str] = None
    role: str
    
    class Config:
        orm_mode = True