from datetime import datetime
from .base_schema import BaseSchema

class ShowtimeBase(BaseSchema):
    movie_id: int
    room_id: int
    start_time: datetime
    end_time: datetime
    base_price: float
    status: str = "active"

class ShowtimeCreate(ShowtimeBase):
    pass

class ShowtimeRead(ShowtimeBase):
    id: int
    created_at: datetime
