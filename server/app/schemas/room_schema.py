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

class RoomUpdate(BaseSchema):
    name: Optional[str] = Field(None, min_length=1, max_length=50, description="Room name")
    room_type: Optional[str] = Field(None, description="Room type (2D, 3D, IMAX, etc.)")
    total_seats: Optional[int] = Field(None, gt=0, description="Total seats must be positive")
    theater_id: Optional[int] = Field(None, gt=0, description="Theater ID must be positive")
    
    @validator('room_type')
    def validate_room_type(cls, v):
        if v is None:
            return v
        valid_types = ['2D', '3D', 'IMAX', '4DX', 'VIP']
        if v not in valid_types:
            return v
        return v

class RoomRead(RoomBase):
    id: int
    created_at: datetime
    
