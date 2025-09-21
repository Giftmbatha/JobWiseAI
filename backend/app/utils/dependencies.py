from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.database import get_db
from app.models.user import User
from app.utils.auth import decode_access_token
from sqlalchemy.orm import Session

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    print(f"Validating token for current user")
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    email, role = decode_access_token(token)
    if email is None:
        print("Token validation failed: Could not decode token")
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None or not user.is_active:
        print(f"User not found or inactive: {email}")
        raise credentials_exception
        
    print(f"User validated: {user.email}, Role: {user.role}")
    return user


# app/utils/dependencies.py - Simplified version
async def get_current_employer(
    current_user: User = Depends(get_current_user)
):
    """Check if the current user is an employer"""
    print(f"Checking employer role for: {current_user.email}, role: {current_user.role}")
    
    # Since we changed to string storage, we can directly compare
    if current_user.role not in ['EMPLOYER', 'ADMIN']:
        raise HTTPException(status_code=403, detail="Employer access required")
    
    print(f"Access granted: User is an employer")
    return current_user

async def get_current_admin(
    current_user: User = Depends(get_current_user)
):
    """Check if the current user is an admin"""
    print(f"Checking admin role for: {current_user.email}, role: {current_user.role}")
    
    if current_user.role not in ['EMPLOYER']:
        print(f" Access denied: User role is '{current_user.role}', expected 'ADMIN'")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required."
        )
    
    print(f"Access granted: User is an admin")
    return current_user