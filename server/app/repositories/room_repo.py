from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.room import Room
from app.repositories.base_repo import BaseRepository
from app.schemas.room_schema import RoomCreate, RoomBase

class RoomRepository(BaseRepository[Room, RoomCreate, RoomBase]):
    def __init__(self):
        super().__init__(Room)

    # -------------------- GET BY THEATER --------------------
    def get_by_theater(self, db: Session, theater_id: int) -> List[Room]:
        """Lấy tất cả phòng của 1 rạp"""
        return db.query(Room).filter(Room.theater_id == theater_id).all()

    # -------------------- GET BY ID --------------------
    def get_by_id(self, db: Session, room_id: int) -> Optional[Room]:
        return db.query(Room).filter(Room.id == room_id).first()

    # -------------------- GET ALL --------------------
    def get_all(self, db: Session) -> List[Room]:
        return db.query(Room).order_by(Room.id).all()

    # -------------------- PAGINATED --------------------
    def get_paginated(self, db: Session, offset: int = 0, limit: int = 10) -> List[Room]:
        return db.query(Room).order_by(Room.id).offset(offset).limit(limit).all()

    def get_paginated_by_theater(self, db: Session, theater_id: int, offset: int = 0, limit: int = 10) -> List[Room]:
        return (
            db.query(Room)
            .filter(Room.theater_id == theater_id)
            .order_by(Room.id)
            .offset(offset)
            .limit(limit)
            .all()
        )

    # -------------------- COUNT --------------------
    def count_all(self, db: Session) -> int:
        return db.query(Room).count()

    def count_by_theater(self, db: Session, theater_id: int) -> int:
        return db.query(Room).filter(Room.theater_id == theater_id).count()
