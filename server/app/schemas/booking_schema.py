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

class BookingUpdate(BookingBase):
    pass