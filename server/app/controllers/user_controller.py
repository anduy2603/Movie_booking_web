from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.config.database import get_db
from app.services.user_service import UserService
from app.repositories.user_repo import UserRepository
from app.schemas.user_schema import UserCreate, UserRead, UserUpdate
from app.schemas.base_schema import PaginatedResponse, PaginationParams, create_paginated_response
from app.dependencies import get_pagination_params
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
def get_users(
    pagination: PaginationParams = Depends(get_pagination_params),
    db: Session = Depends(get_db)
):
    skip = (pagination.page - 1) * pagination.size
    users, total = user_service.get_all_paginated(db, skip=skip, limit=pagination.size)
    return create_paginated_response(users, total, pagination)

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

@router.delete("/{user_id}", dependencies=[Depends(requires_role("admin"))])
def delete_user(
    user_id: int, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Xóa user (chỉ admin mới có quyền)"""
    try:
        logger.info(f"[UserController] delete_user({user_id}) called by admin {current_user.id}")
        
        # Kiểm tra user có tồn tại không
        target = user_service.get_by_id(db, user_id)
        if not target:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Không cho phép xóa tài khoản admin
        if target.role == "admin":
            raise HTTPException(status_code=403, detail="Cannot delete admin accounts")
        
        # Không cho phép xóa chính mình
        if current_user.id == user_id:
            raise HTTPException(status_code=403, detail="Cannot delete your own account")
        
        # Xóa user
        try:
            deleted_user = user_service.delete(db, user_id)
            if not deleted_user:
                logger.error(f"[UserController] delete() returned None for user_id={user_id}")
                raise HTTPException(status_code=500, detail="Failed to delete user: service returned None")
            
            logger.info(f"[UserController] User {user_id} deleted successfully")
            return {"message": "User deleted successfully", "id": user_id}
        except HTTPException:
            # Re-raise HTTPException để giữ nguyên status code và CORS headers
            raise
        except Exception as e:
            error_msg = str(e)
            logger.error(f"[UserController] Error deleting user {user_id}: {error_msg}", exc_info=True)
            # Trả về thông báo lỗi chi tiết trong debug mode, ẩn trong production
            from app.config.settings import settings
            detail = error_msg if settings.DEBUG else "Failed to delete user. Please check server logs for details."
            raise HTTPException(status_code=500, detail=detail)
    except HTTPException:
        # Re-raise HTTPException để FastAPI handle với CORS headers
        raise
    except Exception as e:
        logger.error(f"[UserController] Unexpected error in delete_user: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
