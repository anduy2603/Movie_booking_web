from datetime import date, datetime
from typing import Optional
from pydantic import Field, validator, HttpUrl
from .base_schema import BaseSchema

class MovieBase(BaseSchema):
    title: str = Field(..., min_length=1, max_length=200, description="Movie title cannot be empty")
    description: Optional[str] = Field(None, max_length=2000, description="Movie description")
    genre: Optional[str] = Field(None, max_length=80, description="Movie genre")
    duration: Optional[int] = Field(None, gt=0, description="Movie duration in minutes (must be positive)")
    language: Optional[str] = Field(None, max_length=50, description="Movie language")
    release_date: Optional[date] = Field(None, description="Movie release date")
    poster_url: Optional[str] = Field(None, max_length=255, description="Poster image URL")
    trailer_url: Optional[str] = Field(None, max_length=255, description="Trailer video URL")
    
    @validator('poster_url')
    def validate_poster_url(cls, v):
        """Validate poster URL format"""
        if v is None or v == "":
            return v
        # Kiểm tra URL format cơ bản
        if not (v.startswith('http://') or v.startswith('https://')):
            raise ValueError('poster_url must be a valid HTTP/HTTPS URL')
        return v
    
    @validator('trailer_url')
    def validate_trailer_url(cls, v):
        """Validate trailer URL format"""
        if v is None or v == "":
            return v
        # Kiểm tra URL format cơ bản
        if not (v.startswith('http://') or v.startswith('https://')):
            raise ValueError('trailer_url must be a valid HTTP/HTTPS URL')
        return v

class MovieCreate(MovieBase):
    pass

class MovieRead(MovieBase):
    id: int
    created_at: datetime
    liked_by_count: Optional[int] = 0 
