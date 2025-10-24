from datetime import datetime
from typing import Optional
from .base_schema import BaseSchema

class RoomBase(BaseSchema):
    name: str
    room_type: str
    total_seats: int
    theater_id: int

class RoomCreate(RoomBase):
    pass

class RoomRead(RoomBase):
    id: int
    created_at: datetime
    
