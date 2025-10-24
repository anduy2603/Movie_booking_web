from __future__ import annotations
from typing import List
from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models import Base, TimestampMixin

class Showtime(TimestampMixin, Base):
    __tablename__ = "showtimes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    movie_id: Mapped[int] = mapped_column(ForeignKey("movies.id", ondelete="CASCADE"), index=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id", ondelete="CASCADE"), index=True)
    start_time: Mapped[datetime] = mapped_column(DateTime, index=True)
    end_time: Mapped[datetime] = mapped_column(DateTime)
    base_price: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(20), default="active")  # active | cancelled | finished

    movie: Mapped["Movie"] = relationship(back_populates="showtimes")
    room: Mapped["Room"] = relationship(back_populates="showtimes")
    bookings: Mapped[List["Booking"]] = relationship(back_populates="showtime", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Showtime id={self.id} movie={self.movie_id} room={self.room_id}>"
