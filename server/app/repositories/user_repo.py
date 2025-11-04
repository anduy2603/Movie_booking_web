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
        """Xóa user theo ID (hard delete - SQLite foreign keys đã được bật, CASCADE sẽ tự động xử lý)"""
        logger.info(f"[UserRepository] Delete user_id={user_id}")
        user = db.get(User, user_id)
        if not user:
            logger.warning(f"[UserRepository] User id={user_id} not found")
            return None

        try:
            # SQLite với foreign keys enabled sẽ tự động xử lý CASCADE:
            # - favorites: ondelete="CASCADE" -> tự động xóa
            # - bookings: ondelete="CASCADE" -> tự động xóa  
            # - payments.created_by: ondelete="SET NULL" -> tự động set NULL
            
            # Xóa manual các records liên quan để đảm bảo an toàn
            from app.models.booking import Booking
            from app.models.favorites import favorites
            from app.models.payment import Payment
            from sqlalchemy import delete as sql_delete, text
            from sqlalchemy.exc import SQLAlchemyError
            
            # 1. Xóa favorites (many-to-many relationship)
            try:
                stmt = sql_delete(favorites).where(favorites.c.user_id == user_id)
                result = db.execute(stmt)
                logger.info(f"[UserRepository] Deleted {result.rowcount} favorites for user {user_id}")
            except Exception as fav_error:
                logger.warning(f"[UserRepository] Error deleting favorites (will try raw SQL): {fav_error}")
                try:
                    db.execute(text("DELETE FROM favorites WHERE user_id = :user_id"), {"user_id": user_id})
                    logger.info(f"[UserRepository] Deleted favorites using raw SQL")
                except Exception as e2:
                    logger.warning(f"[UserRepository] Failed to delete favorites, will rely on CASCADE: {e2}")
            
            # 2. Xóa bookings (quan trọng - phải xóa trước)
            try:
                bookings = db.query(Booking).filter(Booking.user_id == user_id).all()
                booking_count = len(bookings)
                if booking_count > 0:
                    for booking in bookings:
                        db.delete(booking)
                    logger.info(f"[UserRepository] Deleted {booking_count} bookings for user {user_id}")
                else:
                    logger.info(f"[UserRepository] No bookings found for user {user_id}")
            except SQLAlchemyError as booking_error:
                logger.error(f"[UserRepository] SQLAlchemy error deleting bookings: {booking_error}", exc_info=True)
                db.rollback()
                raise Exception(f"Database error while deleting bookings: {str(booking_error)}")
            except Exception as booking_error:
                logger.error(f"[UserRepository] Unexpected error deleting bookings: {booking_error}", exc_info=True)
                db.rollback()
                raise Exception(f"Failed to delete bookings for user {user_id}: {str(booking_error)}")
            
            # 3. Payments.created_by sẽ SET NULL tự động (ondelete="SET NULL")
            # Nhưng để chắc chắn, ta sẽ update manual (không bắt buộc)
            try:
                payment_count = db.query(Payment).filter(Payment.created_by == user_id).update(
                    {"created_by": None}, 
                    synchronize_session=False
                )
                if payment_count > 0:
                    logger.info(f"[UserRepository] Updated {payment_count} payments for user {user_id}")
            except Exception as pay_error:
                logger.warning(f"[UserRepository] Error updating payments (will rely on SET NULL): {pay_error}")
            
            # 4. Cuối cùng xóa user
            try:
                db.delete(user)
                db.commit()
                logger.info(f"[UserRepository] User id={user_id} deleted successfully")
                return user
            except SQLAlchemyError as delete_error:
                logger.error(f"[UserRepository] SQLAlchemy error deleting user: {delete_error}", exc_info=True)
                db.rollback()
                raise Exception(f"Database error while deleting user: {str(delete_error)}")
            
        except Exception as e:
            # Đảm bảo rollback nếu chưa rollback
            try:
                db.rollback()
            except Exception:
                pass
            logger.error(f"[UserRepository] Failed to delete user id={user_id}: {e}", exc_info=True)
            # Raise với thông tin chi tiết để debug
            raise Exception(f"Failed to delete user {user_id}: {str(e)}")