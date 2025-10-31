from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.config.database import get_db
from app.services.user_service import UserService
from app.repositories.user_repo import UserRepository
from app.schemas.user_schema import UserCreate, UserRead, UserUpdate
from app.schemas.base_schema import PaginatedResponse
from app.config import logger
from app.models.user import User
from app.auth.permissions import get_current_user, requires_role

router = APIRouter(prefix="/users", tags=["Users"])
user_service = UserService()

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role,
    }

@router.post("/", response_model=UserRead, dependencies=[Depends(requires_role("admin"))])
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    logger.info("[UserController] create_user() called")
    return user_service.create(db, user_in)

@router.get("/", response_model=PaginatedResponse[UserRead], dependencies=[Depends(requires_role("admin"))])
def get_users(page: int = 1, size: int = 10, db: Session = Depends(get_db)):
    skip = (page - 1) * size
    users, total = user_service.get_all_paginated(db, skip=skip, limit=size)
    pages = (total + size - 1) // size
    return PaginatedResponse[UserRead](
        data=users, total=total, page=page, size=size, pages=pages
    )

@router.get("/{user_id}", response_model=UserRead, dependencies=[Depends(requires_role("admin"))])
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    logger.info(f"[UserController] get_user_by_id({user_id}) called")
    user = user_service.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/email/{email}", response_model=UserRead, dependencies=[Depends(requires_role("admin"))])
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    logger.info(f"[UserController] get_user_by_email({email}) called")
    return user_service.get_by_email(db, email)

@router.put("/{user_id}", response_model=UserRead)
def update_user(
    user_id: int, 
    user_in: UserUpdate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Admin có thể sửa bất kỳ user nào, user chỉ có thể sửa chính mình
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only update your own profile")
    
    user = user_service.update(db, user_id, user_in)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: int, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Admin có thể xóa bất kỳ user nào, user chỉ có thể xóa chính mình
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only delete your own account")
    # Không cho phép xóa tài khoản admin
    target = user_service.get_by_id(db, user_id)
    if target and target.role == "admin":
        raise HTTPException(status_code=403, detail="Cannot delete admin accounts")

    logger.info(f"[UserController] delete_user({user_id}) called")
    deleted_user = user_service.delete(db, user_id)
    if not deleted_user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User with id {user_id} deleted successfully"}
