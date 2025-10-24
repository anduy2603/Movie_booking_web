from datetime import datetime
from typing import Optional
from .base_schema import BaseSchema

class TheaterBase(BaseSchema):
    name: str
    city: str
    address: str

class TheaterCreate(TheaterBase):
    pass

class TheaterRead(TheaterBase):
    id: int
    created_at: datetime
    