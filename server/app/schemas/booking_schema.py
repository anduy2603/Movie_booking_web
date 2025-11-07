from datetime import datetime
from typing import Optional
from .base_schema import BaseSchema

class BookingBase(BaseSchema):
    showtime_id: int
    seat_id: int
    price: float
    status: str = "pending"

class BookingCreate(BookingBase):
    user_id: int
    payment_id: Optional[int] = None

class BookingRead(BookingBase):
    id: int
    user_id: int
    payment_id: Optional[int] = None
    created_at: datetime

class BookingDetailRead(BookingRead):
    """Booking với thông tin chi tiết về showtime, movie, theater"""
    # Thông tin showtime
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    
    # Thông tin movie
    movie_title: Optional[str] = None
    movie_poster_url: Optional[str] = None
    
    # Thông tin theater và room
    theater_name: Optional[str] = None
    theater_address: Optional[str] = None
    room_name: Optional[str] = None
    
    # Thông tin seat
    seat_row: Optional[str] = None
    seat_number: Optional[int] = None

class BookingUpdate(BookingBase):
    pass