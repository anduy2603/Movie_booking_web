from datetime import datetime
from .base_schema import BaseSchema

class SeatBase(BaseSchema):
    row: str
    number: int
    seat_type: str = "standard"
    price_modifier: float = 1.0
    room_id: int

class SeatCreate(SeatBase):
    pass

class SeatRead(SeatBase):
    id: int
    is_active: bool
    created_at: datetime
