from __future__ import annotations
from typing import List, Optional
from datetime import date, datetime
from sqlalchemy import String, Integer, Date, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models import Base, favorites, TimestampMixin

class Movie(TimestampMixin, Base):
    __tablename__ = "movies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[Optional[str]] = mapped_column(String(2000))
    genre: Mapped[Optional[str]] = mapped_column(String(80))
    duration: Mapped[Optional[int]] = mapped_column(Integer)  # minutes
    language: Mapped[Optional[str]] = mapped_column(String(50))
    release_date: Mapped[Optional[date]] = mapped_column(Date)
    poster_url: Mapped[Optional[str]] = mapped_column(String(255)) 
    trailer_url: Mapped[Optional[str]] = mapped_column(String(255))

    # relationships
    showtimes: Mapped[List["Showtime"]] = relationship(back_populates="movie", cascade="all, delete-orphan")

    liked_by: Mapped[List["User"]] = relationship(
        "User", secondary=favorites, back_populates="favorite_movies"
    )

    def __repr__(self) -> str:
        return f"<Movie id={self.id} title={self.title!r}>"
