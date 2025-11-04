# app/services/booking_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Tuple, Optional
from app.services.base_service import BaseService
from app.repositories.booking_repo import BookingRepository
from app.models.booking import Booking
from app.schemas.booking_schema import BookingCreate, BookingUpdate, BookingRead
from app.config.logger import logger


class BookingService(BaseService[Booking, BookingCreate, BookingUpdate]):
    def __init__(self, repository: Optional[BookingRepository] = None):
        super().__init__(repository=repository or BookingRepository(), service_name="BookingService")

    # -------------------- CUSTOM METHODS --------------------

    def create_booking(self, db: Session, booking_in: BookingCreate) -> BookingRead:
        """Tạo booking mới nhưng kiểm tra chỗ ngồi trùng"""
        logger.info(f"Creating booking for seat={booking_in.seat_id}, showtime={booking_in.showtime_id}")
        existing = self.repository.get_by_seat(db, booking_in.showtime_id, booking_in.seat_id)
        if existing:
            logger.warning(f"Seat {booking_in.seat_id} for showtime {booking_in.showtime_id} already booked")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This seat has already been booked.")
        return self.repository.create(db, booking_in)

    def get_booking_by_id(self, db: Session, booking_id: int) -> BookingRead:
        booking = self.repository.get_by_id(db, booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        return booking

    def cancel_booking(self, db: Session, booking_id: int) -> BookingRead:
        """Hủy đặt vé và update payment status nếu có"""
        booking = self.repository.get_by_id(db, booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        
        booking.status = "cancelled"
        
        # Update payment status to cancelled if payment exists
        if booking.payment_id:
            try:
                from app.services.payment_service import PaymentService
                payment_service = PaymentService()
                payment = payment_service.get_by_id(db, booking.payment_id)
                if payment and payment.status not in ["cancelled", "failed"]:
                    payment_service.update_payment_status(db, booking.payment_id, "cancelled")
                    logger.info(f"Payment {booking.payment_id} status updated to cancelled")
            except Exception as e:
                logger.warning(f"Failed to update payment status: {e}")
        
        db.commit()
        db.refresh(booking)
        logger.info(f"Booking id={booking_id} cancelled successfully")
        return booking

    def get_bookings_paginated(self, db: Session, page: int, size: int) -> Tuple[List[BookingRead], int]:
        """Lấy danh sách booking có phân trang"""
        offset = (page - 1) * size
        items = self.repository.get_paginated(db, offset=offset, limit=size)
        total = self.repository.count_all(db)
        return items, total

    def get_user_bookings_paginated(self, db: Session, user_id: int, page: int, size: int) -> Tuple[List[BookingRead], int]:
        """Lấy danh sách booking của user có phân trang"""
        offset = (page - 1) * size
        items = self.repository.get_paginated_by_user(db, user_id, offset=offset, limit=size)
        total = self.repository.count_by_user(db, user_id)
        return items, total

    def delete_booking(self, db: Session, booking_id: int) -> BookingRead:
        """Xóa booking và update payment nếu cần"""
        booking = self.repository.get_by_id(db, booking_id)
        if not booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        
        payment_id = booking.payment_id  # Lưu payment_id trước khi delete
        
        # Check if payment has other bookings before deleting
        has_other_bookings = False
        if payment_id:
            try:
                from app.models.booking import Booking
                other_bookings_count = db.query(Booking).filter(
                    Booking.payment_id == payment_id,
                    Booking.id != booking_id
                ).count()
                has_other_bookings = other_bookings_count > 0
            except Exception as e:
                logger.warning(f"Failed to check other bookings: {e}")
        
        # Delete booking (payment_id trong booking sẽ tự động SET NULL nhờ foreign key constraint)
        deleted_booking = self.repository.delete(db, booking_id)
        
        # Update payment status if no other bookings exist
        if payment_id and not has_other_bookings:
            try:
                from app.services.payment_service import PaymentService
                payment_service = PaymentService()
                payment = payment_service.get_by_id(db, payment_id)
                if payment and payment.status not in ["cancelled", "failed"]:
                    payment_service.update_payment_status(db, payment_id, "cancelled")
                    logger.info(f"Payment {payment_id} status updated to cancelled after booking deletion")
            except Exception as e:
                logger.warning(f"Failed to update payment status after booking deletion: {e}")
        
        if not deleted_booking:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
        return deleted_booking

    def get_bookings_by_showtime(self, db: Session, showtime_id: int):
        """Return all bookings for a given showtime (used to determine occupied seats)."""
        return self.repository.get_by_showtime(db, showtime_id)


