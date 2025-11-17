from datetime import datetime, timezone
from pydantic import validator, Field
from .base_schema import BaseSchema

class ShowtimeBase(BaseSchema):
    movie_id: int = Field(..., gt=0, description="Movie ID must be positive")
    room_id: int = Field(..., gt=0, description="Room ID must be positive")
    start_time: datetime
    end_time: datetime
    base_price: float = Field(..., gt=0, description="Base price must be positive")
    status: str = Field(default="active", description="Showtime status")
    
    @validator('end_time')
    def end_after_start(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v
    
    @validator('status')
    def validate_status(cls, v):
        valid_statuses = ['active', 'cancelled', 'completed', 'scheduled']
        if v not in valid_statuses:
            raise ValueError(f'status must be one of: {valid_statuses}')
        return v

class ShowtimeCreate(ShowtimeBase):
    @validator('start_time')
    def start_not_in_past(cls, v):
        """Không cho phép tạo showtime với start_time trong quá khứ"""
        now = datetime.now(timezone.utc)
        # Chuyển v về UTC nếu có timezone, nếu không thì giả định là UTC
        if v.tzinfo is None:
            v_utc = v.replace(tzinfo=timezone.utc)
        else:
            v_utc = v.astimezone(timezone.utc)
        
        if v_utc < now:
            raise ValueError('start_time cannot be in the past')
        return v

class ShowtimeRead(ShowtimeBase):
    id: int
    created_at: datetime
