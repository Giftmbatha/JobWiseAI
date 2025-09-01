# app/schemas/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional

# Base schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserCreateGoogle(UserBase):
    google_id: str

class UserInDB(UserBase):
    id: int
    is_active: bool
    is_superuser: bool

    class Config:
        orm_mode = True  # Use this for Pydantic v1

# Response schemas - Make sure they match the database model
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool
    is_superuser: bool

    class Config:
        orm_mode = True

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None