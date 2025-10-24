from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.booking import Booking
from app.repositories.base_repo import BaseRepository
from app.schemas.booking_schema import BookingCreate, BookingBase

class BookingRepository(BaseRepository[Booking, BookingCreate, BookingBase]):
    def __init__(self):
        super().__init__(Booking)

    # -------------------- LẤY THEO USER --------------------
    def get_by_user_id(self, db: Session, user_id: int) -> List[Booking]:
        """Lấy tất cả booking của 1 user."""
        return db.query(Booking).filter(Booking.user_id == user_id).all()

    # -------------------- LẤY THEO SHOWTIME --------------------
    def get_by_showtime(self, db: Session, showtime_id: int) -> List[Booking]:
        """Lấy tất cả booking thuộc một suất chiếu."""
        return db.query(Booking).filter(Booking.showtime_id == showtime_id).all()

    # -------------------- LẤY THEO GHẾ --------------------
    def get_by_seat(self, db: Session, showtime_id: int, seat_id: int) -> Optional[Booking]:
        """Kiểm tra xem ghế này trong suất chiếu đã được đặt chưa."""
        return (
            db.query(Booking)
            .filter(Booking.showtime_id == showtime_id, Booking.seat_id == seat_id)
            .first()
        )

    # -------------------- PHÂN TRANG --------------------
    def get_paginated(self, db: Session, offset: int = 0, limit: int = 10) -> List[Booking]:
        """Lấy danh sách booking phân trang"""
        return db.query(Booking).order_by(Booking.id).offset(offset).limit(limit).all()

    def get_paginated_by_user(self, db: Session, user_id: int, offset: int = 0, limit: int = 10) -> List[Booking]:
        """Lấy danh sách booking của user phân trang"""
        return (
            db.query(Booking)
            .filter(Booking.user_id == user_id)
            .order_by(Booking.id)
            .offset(offset)
            .limit(limit)
            .all()
        )

    # -------------------- ĐẾM TỔNG SỐ --------------------
    def count_all(self, db: Session) -> int:
        """Đếm tổng số booking"""
        return db.query(Booking).count()

    def count_by_user(self, db: Session, user_id: int) -> int:
        """Đếm tổng số booking của 1 user"""
        return db.query(Booking).filter(Booking.user_id == user_id).count()
