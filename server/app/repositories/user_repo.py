from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List, Optional

from app.models.user import User
from app.repositories.base_repo import BaseRepository
from app.schemas.user_schema import UserCreate, UserRead
from app.config import logger

class UserRepository(BaseRepository[User, UserCreate, UserRead]):
    def __init__(self):
        super().__init__(User)
        self.repo_name = self.__class__.__name__

    def get_all_paginated(self, db: Session, skip: int, limit: int) -> tuple[List[User], int]:
        """Lấy danh sách user có phân trang"""
        logger.info(f"[UserRepository] Get all paginated (skip={skip}, limit={limit})")
        total = db.query(User).count()
        data = db.query(User).offset(skip).limit(limit).all()
        return data, total

    def get_by_email(self, db: Session, email: str) -> Optional[User]: 
        """Lấy user theo email"""
        logger.info(f"[UserRepository] Get by email={email}")
        state = select(User).where(User.email == email)
        return db.scalar(state)

    def get_by_clerk_id(self, db: Session, clerk_id: str) -> Optional[User]:
        """Lấy user theo clerk_id (auth id)"""
        logger.info(f"[UserRepository] Get by clerk_id={clerk_id}")
        state = select(User).where(User.clerk_id == clerk_id)
        return db.scalar(state)

    def delete(self, db: Session, user_id: int) -> Optional[User]:
        """Xóa user theo ID"""
        logger.info(f"[UserRepository] Delete user_id={user_id}")
        user = db.get(User, user_id)
        if not user:
            logger.warning(f"[UserRepository] User id={user_id} not found")
            return None

        db.delete(user)
        db.commit()
        logger.info(f"[UserRepository] User id={user_id} deleted successfully")
        return user