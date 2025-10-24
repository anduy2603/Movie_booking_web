from __future__ import annotations
from typing import List, Optional
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from .base_model import Base

class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    method: Mapped[str] = mapped_column(String(20))  # momo | zalopay | visa | cash | ...
    amount: Mapped[float] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending | success | failed
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Ai thực hiện thanh toán (user)
    created_by: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    creator: Mapped[Optional["User"]] = relationship(back_populates="payments_created")

    # 1 payment -> N bookings
    bookings: Mapped[List["Booking"]] = relationship(back_populates="payment")

    def __repr__(self) -> str:
        return f"<Payment id={self.id} amount={self.amount} status={self.status}>"
