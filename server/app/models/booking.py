from __future__ import annotations
from typing import Optional
from sqlalchemy import String, Integer, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models import Base,TimestampMixin

class Booking(TimestampMixin, Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # references
    payment_id: Mapped[Optional[int]] = mapped_column(ForeignKey("payments.id", ondelete="SET NULL"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    showtime_id: Mapped[int] = mapped_column(ForeignKey("showtimes.id", ondelete="CASCADE"), index=True)
    seat_id: Mapped[int] = mapped_column(ForeignKey("seats.id", ondelete="CASCADE"), index=True)

    price: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending | confirmed | cancelled

    __table_args__ = (
        UniqueConstraint("showtime_id", "seat_id", name="uq_showtime_seat"),  # ngăn trùng ghế trong cùng suất
    )

    # relationships
    user: Mapped["User"] = relationship(back_populates="bookings")
    showtime: Mapped["Showtime"] = relationship(back_populates="bookings")
    seat: Mapped["Seat"] = relationship(back_populates="bookings")
    payment: Mapped[Optional["Payment"]] = relationship(back_populates="bookings")

    def __repr__(self) -> str:
        return f"<Booking id={self.id} showtime={self.showtime_id} seat={self.seat_id} status={self.status}>"
