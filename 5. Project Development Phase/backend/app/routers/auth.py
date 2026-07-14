from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.app.database.database import get_db
from backend.app.models.models import User, AuditLog
from backend.app.schemas.schemas import UserRegister, UserOut, UserLogin, Token, ProfileUpdate
from backend.app.auth.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        full_name=user_data.full_name,
        email=user_data.email,
        password_hash=hashed_password,
        phone=user_data.phone,
        monthly_income=user_data.monthly_income,
        occupation=user_data.occupation
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Log action
    log = AuditLog(user_id=new_user.id, action="Registration successful")
    db.add(log)
    db.commit()

    return new_user

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    # Find user
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate access token
    access_token = create_access_token(data={"sub": user.email, "id": user.id})

    # Log action
    log = AuditLog(user_id=user.id, action="User login successful")
    db.add(log)
    db.commit()

    return {"access_token": access_token, "token_type": "bearer"}

# Add OAuth2 support endpoint for standard Swagger Docs login UI
@router.post("/token", response_model=Token, include_in_schema=False)
def login_for_swagger(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email, "id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    log = AuditLog(user_id=current_user.id, action="User logout successful")
    db.add(log)
    db.commit()
    return {"detail": "Successfully logged out"}

@router.get("/profile", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserOut)
def update_profile(profile_data: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    if profile_data.phone is not None:
        current_user.phone = profile_data.phone
    if profile_data.monthly_income is not None:
        current_user.monthly_income = profile_data.monthly_income
    if profile_data.occupation is not None:
        current_user.occupation = profile_data.occupation

    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    log = AuditLog(user_id=current_user.id, action="Profile updated")
    db.add(log)
    db.commit()

    return current_user
