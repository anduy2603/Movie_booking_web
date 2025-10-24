from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from datetime import timedelta, datetime

from app.config.database import get_db
from app.models.user import User
from app.auth.jwt_auth import (
    authenticate_user, 
    create_access_token, 
    get_password_hash,
    verify_password,
    get_current_user_from_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.schemas.user_schema import (
    UserCreate, 
    UserRead, 
    LoginRequest, 
    TokenResponse, 
    PasswordChange,
    UserUpdate
)

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

@router.post("/register", response_model=TokenResponse)
def register(request: UserCreate, db: Session = Depends(get_db)):
    """Đăng ký user mới"""
    # Kiểm tra email đã tồn tại chưa
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Kiểm tra username nếu có
    if request.username:
        existing_username = db.query(User).filter(User.username == request.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Tạo user mới
    hashed_password = get_password_hash(request.password)
    user = User(
        email=request.email,
        username=request.username,
        full_name=request.full_name,
        hashed_password=hashed_password,
        role="customer"
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Tạo access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserRead.from_orm(user)
    )

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Đăng nhập"""
    user = authenticate_user(db, request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is deactivated"
        )
    
    # Cập nhật last_login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Tạo access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserRead.from_orm(user)
    )

@router.post("/change-password")
def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """Đổi mật khẩu"""
    # Xác minh mật khẩu cũ
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Cập nhật mật khẩu mới
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.get("/me", response_model=UserRead)
def get_current_user_info(current_user: User = Depends(get_current_user_from_token)):
    """Lấy thông tin user hiện tại"""
    return UserRead.from_orm(current_user)

@router.put("/me", response_model=UserRead)
def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user_from_token),
    db: Session = Depends(get_db)
):
    """Cập nhật thông tin profile"""
    # Kiểm tra email mới nếu có
    if user_update.email and user_update.email != current_user.email:
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Kiểm tra username mới nếu có
    if user_update.username and user_update.username != current_user.username:
        existing_username = db.query(User).filter(User.username == user_update.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Cập nhật thông tin
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return UserRead.from_orm(current_user)

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user_from_token)):
    """Đăng xuất (client sẽ xóa token)"""
    return {"message": "Logged out successfully"}
