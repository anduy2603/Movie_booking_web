from __future__ import annotations
from typing import List
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models import Base, TimestampMixin



class Room(TimestampMixin, Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    theater_id: Mapped[int] = mapped_column(ForeignKey("theaters.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(50))
    room_type: Mapped[str] = mapped_column(String(20))  # 2D | 3D | IMAX | etc.
    total_seats: Mapped[int] = mapped_column(Integer)

    theater: Mapped["Theater"] = relationship(back_populates="rooms")
    seats: Mapped[List["Seat"]] = relationship(back_populates="room", cascade="all, delete-orphan")
    showtimes: Mapped[List["Showtime"]] = relationship(back_populates="room", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Room id={self.id} name={self.name!r} type={self.room_type}>"
