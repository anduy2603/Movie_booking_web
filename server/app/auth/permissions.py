from fastapi import Depends, HTTPException, status
from app.auth.jwt_auth import get_current_user_from_token
from app.models.user import User

def requires_role(*roles: str):
    """
    Decorator dùng để giới hạn quyền truy cập theo vai trò (role).
    Ví dụ: @router.post("/movies", dependencies=[Depends(requires_role("admin"))])
    """
    def role_checker(current_user: User = Depends(get_current_user_from_token)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User does not have permission. Required roles: {roles}",
            )
        return current_user
    return role_checker

def requires_active_user():
    """
    Decorator để đảm bảo user phải active
    """
    def active_checker(current_user: User = Depends(get_current_user_from_token)):
        if not current_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated",
            )
        return current_user
    return active_checker

def requires_verified_user():
    """
    Decorator để đảm bảo user phải verified
    """
    def verified_checker(current_user: User = Depends(get_current_user_from_token)):
        if not current_user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is not verified",
            )
        return current_user
    return verified_checker

def get_current_user(current_user: User = Depends(get_current_user_from_token)):
    """
    Dependency để lấy current user (đã authenticated)
    """
    return current_user
