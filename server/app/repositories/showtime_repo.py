from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.showtime import Showtime
from app.repositories.base_repo import BaseRepository
from app.schemas.showtime_schema import ShowtimeCreate, ShowtimeBase


class ShowtimeRepository(BaseRepository[Showtime, ShowtimeCreate, ShowtimeBase]):
    def __init__(self):
        super().__init__(Showtime)

    # -------------------- GET BY MOVIE --------------------
    def get_by_movie(self, db: Session, movie_id: int) -> List[Showtime]:
        return db.query(Showtime).filter(Showtime.movie_id == movie_id).order_by(Showtime.start_time).all()

    # -------------------- GET BY ROOM --------------------
    def get_by_room(self, db: Session, room_id: int) -> List[Showtime]:
        return db.query(Showtime).filter(Showtime.room_id == room_id).order_by(Showtime.start_time).all()

    # -------------------- PAGINATION --------------------
    def get_paginated(self, db: Session, offset: int = 0, limit: int = 10) -> List[Showtime]:
        return db.query(Showtime).order_by(Showtime.id).offset(offset).limit(limit).all()

    def get_paginated_by_movie(self, db: Session, movie_id: int, offset: int = 0, limit: int = 10) -> List[Showtime]:
        return (
            db.query(Showtime)
            .filter(Showtime.movie_id == movie_id)
            .order_by(Showtime.start_time)
            .offset(offset)
            .limit(limit)
            .all()
        )

    def get_paginated_by_room(self, db: Session, room_id: int, offset: int = 0, limit: int = 10) -> List[Showtime]:
        return (
            db.query(Showtime)
            .filter(Showtime.room_id == room_id)
            .order_by(Showtime.start_time)
            .offset(offset)
            .limit(limit)
            .all()
        )

    # -------------------- COUNT --------------------
    def count_all(self, db: Session) -> int:
        return db.query(Showtime).count()

    def count_by_movie(self, db: Session, movie_id: int) -> int:
        return db.query(Showtime).filter(Showtime.movie_id == movie_id).count()

    def count_by_room(self, db: Session, room_id: int) -> int:
        return db.query(Showtime).filter(Showtime.room_id == room_id).count()

    # -------------------- BULK DELETE --------------------
    def delete_many(self, db: Session, ids: List[int]) -> int:
        if not ids:
            return 0
        deleted = db.query(Showtime).filter(Showtime.id.in_(ids)).delete(synchronize_session=False)
        db.commit()
        return deleted