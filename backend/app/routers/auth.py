# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.dependencies import get_current_user
from app.schemas.user import UserCreate, UserResponse, Token, UserCreateGoogle
from app.utils.auth import verify_password, get_password_hash, create_access_token
from app.utils.oauth import oauth
from app.config import settings

router = APIRouter()

# Helper function to get or create user
def get_or_create_user(db: Session, email: str, full_name: str = None):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Create new user if doesn't exist
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=None,  # OAuth users have no password
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

# app/routers/auth.py
@router.post("/register", response_model=UserResponse)  # Use UserResponse instead of UserInDB
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Convert to response model
    return UserResponse.from_orm(user)  # Use from_orm for Pydantic v1

@router.post("/login", response_model=Token)
def login(user_data: UserCreate, db: Session = Depends(get_db)):
    # Find user
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)  # Use UserResponse
async def read_users_me(current_user: User = Depends(get_current_user)):
    return UserResponse.from_orm(current_user)  # Convert ORM object to response model

@router.get("/google")
async def login_google(request: Request):
    redirect_uri = request.url_for('auth_google_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback", response_model=Token)
async def auth_google_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google OAuth error: {str(e)}"
        )
    
    # Get user info from Google
    user_info = token.get('userinfo')
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not get user info from Google"
        )
    
    email = user_info.get('email')
    full_name = user_info.get('name')
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email not provided by Google"
        )
    
    # Get or create user in our database
    user = get_or_create_user(db, email, full_name)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}
