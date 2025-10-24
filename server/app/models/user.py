from __future__ import annotations
from typing import List, Optional
from sqlalchemy import String, Integer, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models import Base,  TimestampMixin,  favorites 

class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    username: Mapped[Optional[str]] = mapped_column(String(50), unique=True, index=True, nullable=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(20), default="customer")  # 'admin' | 'customer'
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # JWT Auth fields
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    last_login: Mapped[Optional[DateTime]] = mapped_column(DateTime, nullable=True)

    # relationships
    bookings: Mapped[List["Booking"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    payments_created: Mapped[List["Payment"]] = relationship(
        back_populates="creator", foreign_keys="Payment.created_by"
    )

    # N–N movies via favorites
    favorite_movies: Mapped[List["Movie"]] = relationship(
        "Movie", secondary=favorites, back_populates="liked_by"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
