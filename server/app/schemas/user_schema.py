from datetime import datetime
from typing import Optional
from pydantic import EmailStr, BaseModel, validator
from .base_schema import BaseSchema

# ------------------- Base -------------------
class UserBase(BaseSchema):
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str = "customer"
    is_active: bool = True
    is_verified: bool = False

# ------------------- Create -------------------
class UserCreate(BaseModel):
    email: EmailStr
    username: Optional[str] = None
    full_name: Optional[str] = None
    password: str
    confirm_password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

# ------------------- Update -------------------
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = None

# ------------------- Password Change -------------------
class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

# ------------------- Response -------------------
class UserRead(UserBase):
    id: int
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

# ------------------- Login Request -------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# ------------------- Token Response -------------------
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
