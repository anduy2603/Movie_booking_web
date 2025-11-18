from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import HTTPException, status

from app.models.user import User
from app.services.base_service import BaseService
from app.repositories.user_repo import UserRepository
from app.schemas.user_schema import UserCreate, UserRead, UserUpdate
from app.config.logger import logger
from app.auth.jwt_auth import get_password_hash

class UserService(BaseService[User, UserCreate, UserUpdate]):
    def __init__(self, repo: Optional[UserRepository] = None):
        super().__init__(repository=repo or UserRepository(), service_name="UserService")

    def get_all_paginated(self, db: Session, skip: int, limit: int) -> tuple[List[User], int]:
        """Lấy danh sách user có phân trang"""
        logger.info(f"[UserService] Get all paginated (skip={skip}, limit={limit})")
        return self.repository.get_all_paginated(db, skip, limit)

    def get_by_email(self, db: Session, email: str) -> Optional[User]: 
        """Lấy user theo email"""
        logger.info(f"[UserService] Get by email={email}")
        return self.repository.get_by_email(db, email)

    def get_by_clerk_id(self, db: Session, clerk_id: str) -> Optional[User]:
        """Lấy user theo clerk_id (auth id)"""
        logger.info(f"[UserService] Get by clerk_id={clerk_id}")
        return self.repository.get_by_clerk_id(db, clerk_id)

    def get_by_id(self, db: Session, user_id: int) -> Optional[User]:
        return self.repository.get_by_id(db, user_id)

    def update(self, db: Session, user_id: int, user_in: UserUpdate) -> Optional[User]:
        user = db.get(User, user_id)
        if not user:
            return None

        update_data = user_in.dict(exclude_unset=True)

        # Handle password update securely
        new_password = update_data.pop("password", None)
        confirm_password = update_data.pop("confirm_password", None)
        if new_password:
            if confirm_password and new_password != confirm_password:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Passwords do not match",
                )
            update_data["hashed_password"] = get_password_hash(new_password)

        # Prevent direct updates to protected fields
        protected_fields = {"id", "created_at", "updated_at"}
        for key, value in update_data.items():
            if key in protected_fields:
                continue
            setattr(user, key, value)

        user.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(user)
        return user


    def delete(self, db: Session, user_id: int) -> Optional[User]:
        """Xóa user theo ID"""
        logger.info(f"[UserService] Delete user_id={user_id}")
        return self.repository.delete(db, user_id)