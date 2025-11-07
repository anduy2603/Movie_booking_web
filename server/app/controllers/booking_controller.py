from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.schemas.booking_schema import BookingCreate, BookingRead, BookingDetailRead
from app.schemas.base_schema import PaginatedResponse
from app.config.database import get_db
from app.services.booking_service import BookingService
from app.repositories.booking_repo import BookingRepository
from app.models.user import User
from app.auth.permissions import get_current_user, requires_role

router = APIRouter(prefix="/bookings", tags=["Bookings"])
booking_service = BookingService(BookingRepository())

# -------------------- LIST BOOKINGS WITH PAGINATION --------------------
@router.get("/", response_model=PaginatedResponse[BookingRead], dependencies=[Depends(requires_role("admin"))])
def list_bookings(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Current page number"),
    size: int = Query(10, ge=1, le=100, description="Number of items per page"),
):
    bookings, total = booking_service.get_bookings_paginated(db, page=page, size=size)
    return PaginatedResponse[BookingRead](
        data=bookings,
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size
    )

# -------------------- GET BOOKING BY ID --------------------
@router.get("/{booking_id}", response_model=BookingRead)
def get_booking_by_id(
    booking_id: int, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = booking_service.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Admin có thể xem tất cả booking, user chỉ xem booking của mình
    if current_user.role != "admin" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only view your own bookings")
    
    return booking

# -------------------- GET BOOKINGS BY USER WITH PAGINATION --------------------
@router.get("/user/{user_id}", response_model=PaginatedResponse[BookingDetailRead])
def get_user_bookings(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
):
    # Admin có thể xem booking của bất kỳ user nào, user chỉ xem booking của mình
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only view your own bookings")
    
    bookings, total = booking_service.get_user_bookings_paginated_with_details(db, user_id, page=page, size=size)
    return PaginatedResponse[BookingDetailRead](
        data=bookings,
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size
    )

# -------------------- CREATE BOOKING --------------------
@router.post("/", response_model=List[BookingRead], status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_in: List[BookingCreate], 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tạo booking(s) - user chỉ có thể tạo booking cho chính mình"""
    from app.config.logger import logger
    
    # Đảm bảo user chỉ có thể tạo booking cho chính mình
    for booking_data in booking_in:
        if booking_data.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Forbidden: You can only create bookings for yourself")
    
    created_bookings = []
    errors = []
    
    for idx, booking_data in enumerate(booking_in):
        try:
            logger.info(f"Creating booking {idx+1}/{len(booking_in)}: seat={booking_data.seat_id}, showtime={booking_data.showtime_id}, payment_id={booking_data.payment_id}")
            booking = booking_service.create_booking(db, booking_data)
            created_bookings.append(booking)
            logger.info(f"Booking {idx+1} created successfully: id={booking.id}")
        except HTTPException as e:
            logger.error(f"Failed to create booking {idx+1}: {e.detail}")
            errors.append(f"Booking {idx+1}: {e.detail}")
            # Continue with other bookings
        except Exception as e:
            logger.error(f"Unexpected error creating booking {idx+1}: {str(e)}", exc_info=True)
            errors.append(f"Booking {idx+1}: {str(e)}")
    
    # Nếu có lỗi và không có booking nào được tạo, throw error
    if not created_bookings and errors:
        error_msg = "; ".join(errors)
        raise HTTPException(status_code=400, detail=f"Failed to create bookings: {error_msg}")
    
    # Nếu có một số booking thành công và một số fail, return successful ones
    if errors:
        logger.warning(f"Some bookings failed: {errors}")
    
    return created_bookings

# -------------------- CANCEL BOOKING --------------------
@router.put("/{booking_id}/cancel", response_model=BookingRead)
def cancel_booking(
    booking_id: int, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = booking_service.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Admin có thể cancel bất kỳ booking nào, user chỉ cancel booking của mình
    if current_user.role != "admin" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only cancel your own bookings")
    
    return booking_service.cancel_booking(db, booking_id)

# -------------------- DELETE BOOKING --------------------
@router.delete("/{booking_id}", response_model=BookingRead)
def delete_booking(
    booking_id: int, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = booking_service.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Admin có thể xóa bất kỳ booking nào, user chỉ xóa booking của mình
    if current_user.role != "admin" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only delete your own bookings")
    
    return booking_service.delete_booking(db, booking_id)

# -------------------- PAY BOOKING --------------------
@router.post("/{booking_id}/pay", response_model=BookingRead)
def pay_booking(
    booking_id: int,
    payment_method: str = Query("bank_transfer", description="Payment method (bank_transfer, momo, zalopay, etc.)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Thanh toán booking - tạo payment và link với booking"""
    booking = booking_service.get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Admin có thể thanh toán bất kỳ booking nào, user chỉ thanh toán booking của mình
    if current_user.role != "admin" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only pay for your own bookings")
    
    return booking_service.pay_booking(db, booking_id, payment_method)

# -------------------- GET BOOKINGS BY SHOWTIME --------------------
@router.get("/showtime/{showtime_id}", response_model=List[BookingRead])
def get_bookings_for_showtime(showtime_id: int, db: Session = Depends(get_db)):
    """Return all bookings for a given showtime. This is public to allow front-end
    to determine which seats are already occupied when users select seats."""
    bookings = booking_service.get_bookings_by_showtime(db, showtime_id)
    return bookings
