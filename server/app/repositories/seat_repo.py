from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.seat import Seat
from app.repositories.base_repo import BaseRepository
from app.schemas.seat_schema import SeatCreate, SeatBase


class SeatRepository(BaseRepository[Seat, SeatCreate, SeatBase]):
    def __init__(self):
        super().__init__(Seat)

    # -------------------- GET BY ROOM --------------------
    def get_by_room(self, db: Session, room_id: int) -> List[Seat]:
        """Lấy tất cả ghế thuộc một phòng"""
        return db.query(Seat).filter(Seat.room_id == room_id).order_by(Seat.row, Seat.number).all()

    # -------------------- GET BY ID --------------------
    def get_by_id(self, db: Session, seat_id: int) -> Optional[Seat]:
        return db.query(Seat).filter(Seat.id == seat_id).first()

    # -------------------- PAGINATION --------------------
    def get_paginated(self, db: Session, offset: int = 0, limit: int = 10) -> List[Seat]:
        return db.query(Seat).order_by(Seat.id).offset(offset).limit(limit).all()

    def get_paginated_by_room(self, db: Session, room_id: int, offset: int = 0, limit: int = 10) -> List[Seat]:
        return (
            db.query(Seat)
            .filter(Seat.room_id == room_id)
            .order_by(Seat.row, Seat.number)
            .offset(offset)
            .limit(limit)
            .all()
        )

    # -------------------- COUNT --------------------
    def count_all(self, db: Session) -> int:
        return db.query(Seat).count()

    def count_by_room(self, db: Session, room_id: int) -> int:
        return db.query(Seat).filter(Seat.room_id == room_id).count()
