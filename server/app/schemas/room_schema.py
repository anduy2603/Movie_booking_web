from datetime import datetime
from typing import Optional
from pydantic import Field, validator
from .base_schema import BaseSchema

class RoomBase(BaseSchema):
    name: str = Field(..., min_length=1, max_length=50, description="Room name")
    room_type: str = Field(..., description="Room type (2D, 3D, IMAX, etc.)")
    total_seats: int = Field(..., gt=0, description="Total seats must be positive")
    theater_id: int = Field(..., gt=0, description="Theater ID must be positive")
    
    @validator('room_type')
    def validate_room_type(cls, v):
        valid_types = ['2D', '3D', 'IMAX', '4DX', 'VIP']
        if v not in valid_types:
            # Cho phép các loại khác nhưng cảnh báo
            return v
        return v

class RoomCreate(RoomBase):
    pass

class RoomRead(RoomBase):
    id: int
    created_at: datetime
    
