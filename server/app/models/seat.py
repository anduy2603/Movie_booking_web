from __future__ import annotations
from typing import List
from sqlalchemy import String, Integer, Float, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models import Base, TimestampMixin 

class Seat(TimestampMixin, Base):
    __tablename__ = "seats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id", ondelete="CASCADE"), index=True)
    row: Mapped[str] = mapped_column(String(5))
    number: Mapped[int] = mapped_column(Integer)
    seat_type: Mapped[str] = mapped_column(String(20), default="standard")  # standard | vip | couple
    price_modifier: Mapped[float] = mapped_column(Float, default=1.0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    room: Mapped["Room"] = relationship(back_populates="seats")
    bookings: Mapped[List["Booking"]] = relationship(back_populates="seat")

    def __repr__(self) -> str:
        return f"<Seat id={self.id} code={self.row}{self.number}>"
