from datetime import date, datetime
from typing import Optional
from .base_schema import BaseSchema

class MovieBase(BaseSchema):
    title: str
    description: Optional[str] = None
    genre: Optional[str] = None
    duration: Optional[int] = None
    language: Optional[str] = None
    release_date: Optional[date] = None
    poster_url: Optional[str] = None
    trailer_url: Optional[str] = None

class MovieCreate(MovieBase):
    pass

class MovieRead(MovieBase):
    id: int
    created_at: datetime
    liked_by_count: Optional[int] = 0 
