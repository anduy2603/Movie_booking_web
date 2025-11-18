"""
Unit tests cho UserService
"""
import pytest
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.services.user_service import UserService
from app.schemas.user_schema import UserCreate, UserUpdate
from app.models.user import User


def test_create_user(db_session: Session):
    """Test tạo user mới"""
    service = UserService()
    
    user_data = UserCreate(
        email="newuser@example.com",
        username="newuser",
        full_name="New User",
        password="password123",
        confirm_password="password123",
    )
    
    user = service.create(db_session, user_data)
    
    assert user is not None
    assert user.email == "newuser@example.com"
    assert user.username == "newuser"
    assert user.full_name == "New User"
    assert user.role == "customer"  # Default role
    assert user.is_active is True
    assert user.hashed_password is not None
    assert user.hashed_password != "password123"  # Should be hashed


def test_create_user_duplicate_email(db_session: Session, test_user: User):
    """Test tạo user với email đã tồn tại"""
    service = UserService()
    
    user_data = UserCreate(
        email=test_user.email,  # Email đã tồn tại
        username="anotheruser",
        full_name="Another User",
        password="password123",
        confirm_password="password123",
    )
    
    with pytest.raises(HTTPException) as exc_info:
        service.create(db_session, user_data)
    
    assert exc_info.value.status_code == 400
    assert "email" in exc_info.value.detail.lower() or "already" in exc_info.value.detail.lower()


def test_get_user_by_id(db_session: Session, test_user: User):
    """Test lấy user theo ID"""
    service = UserService()
    
    user = service.get(db_session, test_user.id)
    
    assert user is not None
    assert user.id == test_user.id
    assert user.email == test_user.email


def test_get_user_not_found(db_session: Session):
    """Test lấy user không tồn tại"""
    service = UserService()
    
    user = service.get(db_session, 99999)
    
    assert user is None


def test_update_user(db_session: Session, test_user: User):
    """Test cập nhật user"""
    service = UserService()
    
    update_data = UserUpdate(
        full_name="Updated Name",
        email="updated@example.com",
    )
    
    updated_user = service.update(db_session, test_user.id, update_data)
    
    assert updated_user is not None
    assert updated_user.full_name == "Updated Name"
    assert updated_user.email == "updated@example.com"


def test_update_user_password(db_session: Session, test_user: User):
    """Test cập nhật password"""
    service = UserService()
    from app.auth.jwt_auth import verify_password
    
    old_password_hash = test_user.hashed_password
    
    update_data = UserUpdate(
        password="newpassword123",
        confirm_password="newpassword123",
    )
    
    updated_user = service.update(db_session, test_user.id, update_data)
    
    assert updated_user is not None
    assert updated_user.hashed_password != old_password_hash
    assert verify_password("newpassword123", updated_user.hashed_password)


def test_update_user_not_found(db_session: Session):
    """Test cập nhật user không tồn tại"""
    service = UserService()
    
    update_data = UserUpdate(full_name="Updated Name")
    
    result = service.update(db_session, 99999, update_data)
    
    assert result is None


def test_delete_user(db_session: Session, test_user: User):
    """Test xóa user"""
    service = UserService()
    
    result = service.delete(db_session, test_user.id)
    
    # Service delete trả về User object đã bị xóa
    assert result is not None
    assert isinstance(result, User)
    
    # Verify user đã bị xóa khỏi database
    deleted_user = service.get(db_session, test_user.id)
    assert deleted_user is None

