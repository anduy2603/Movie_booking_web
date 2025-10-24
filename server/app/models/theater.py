from __future__ import annotations
from typing import List
from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models import Base, TimestampMixin

class Theater(TimestampMixin, Base):
    __tablename__ = "theaters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120))
    city: Mapped[str] = mapped_column(String(80))
    address: Mapped[str] = mapped_column(String(255))

    rooms: Mapped[List["Room"]] = relationship(back_populates="theater", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Theater id={self.id} name={self.name!r}>"
