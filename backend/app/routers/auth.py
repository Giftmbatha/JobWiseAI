from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.dependencies import get_current_user
from app.schemas.user import UserCreate, UserResponse, Token, EmployerCreate
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


@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user with string role
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        role="JOB_SEEKER",  # Simple string
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user # Use from_orm for Pydantic v1

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
    
    # Create access token with role information
    access_token = create_access_token(
        data={
            "sub": user.email,
            "role": user.role if user.role is not None else "JOB_SEEKER"  # Include role in token
        }
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    # Manual conversion to ensure proper format
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_active": current_user.is_active,
        "is_superuser": current_user.is_superuser,
        "role": current_user.role or "JOB_SEEKER"  # Ensure role is always set
    }

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


@router.post("/register/employer", response_model=UserResponse)
def register_employer(employer_data: EmployerCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == employer_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new employer user with string role
    hashed_password = get_password_hash(employer_data.password)
    user = User(
        email=employer_data.email,
        full_name=employer_data.full_name,
        hashed_password=hashed_password,
        role="EMPLOYER",  # Simple string
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


@router.post("/create-first-admin", tags=["auth"])
async def create_first_admin(
    admin_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Create the first admin user. Only works if no admin exists yet.
    """
    # Check if any admin already exists
    existing_admin = db.query(User).filter(User.role == 'ADMIN').first()
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin user already exists"
        )
    
    # Check if user with email already exists
    existing_user = db.query(User).filter(User.email == admin_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # Create admin user
    admin_user = User(
        email=admin_data.email,
        full_name=admin_data.full_name,
        hashed_password=get_password_hash(admin_data.password),
        role='ADMIN',
        is_active=True
    )
    
    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)
    
    return {
        "message": "Admin user created successfully",
        "user_id": admin_user.id,
        "email": admin_user.email
    }