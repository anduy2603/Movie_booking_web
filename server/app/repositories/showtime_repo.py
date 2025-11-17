from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime, timezone
from app.models.showtime import Showtime
from app.repositories.base_repo import BaseRepository
from app.schemas.showtime_schema import ShowtimeCreate, ShowtimeBase


class ShowtimeRepository(BaseRepository[Showtime, ShowtimeCreate, ShowtimeBase]):
    def __init__(self):
        super().__init__(Showtime)

    def _filter_future_only(self, query, include_past: bool = False):
        """Filter để chỉ lấy showtime chưa kết thúc (end_time >= now)"""
        if not include_past:
            now = datetime.now(timezone.utc).replace(tzinfo=None)
            query = query.filter(Showtime.end_time >= now)
        return query

    # -------------------- GET BY MOVIE --------------------
    def get_by_movie(self, db: Session, movie_id: int, include_past: bool = False) -> List[Showtime]:
        query = db.query(Showtime).filter(Showtime.movie_id == movie_id)
        query = self._filter_future_only(query, include_past)
        return query.order_by(Showtime.start_time).all()

    # -------------------- GET BY ROOM --------------------
    def get_by_room(self, db: Session, room_id: int, include_past: bool = False) -> List[Showtime]:
        query = db.query(Showtime).filter(Showtime.room_id == room_id)
        query = self._filter_future_only(query, include_past)
        return query.order_by(Showtime.start_time).all()

    # -------------------- PAGINATION --------------------
    def get_paginated(self, db: Session, offset: int = 0, limit: int = 10, include_past: bool = False) -> List[Showtime]:
        query = db.query(Showtime)
        query = self._filter_future_only(query, include_past)
        return query.order_by(Showtime.start_time).offset(offset).limit(limit).all()

    def get_paginated_by_movie(self, db: Session, movie_id: int, offset: int = 0, limit: int = 10, include_past: bool = False) -> List[Showtime]:
        query = db.query(Showtime).filter(Showtime.movie_id == movie_id)
        query = self._filter_future_only(query, include_past)
        return query.order_by(Showtime.start_time).offset(offset).limit(limit).all()

    def get_paginated_by_room(self, db: Session, room_id: int, offset: int = 0, limit: int = 10, include_past: bool = False) -> List[Showtime]:
        query = db.query(Showtime).filter(Showtime.room_id == room_id)
        query = self._filter_future_only(query, include_past)
        return query.order_by(Showtime.start_time).offset(offset).limit(limit).all()

    # -------------------- COUNT --------------------
    def count_all(self, db: Session, include_past: bool = False) -> int:
        query = db.query(Showtime)
        query = self._filter_future_only(query, include_past)
        return query.count()

    def count_by_movie(self, db: Session, movie_id: int, include_past: bool = False) -> int:
        query = db.query(Showtime).filter(Showtime.movie_id == movie_id)
        query = self._filter_future_only(query, include_past)
        return query.count()

    def count_by_room(self, db: Session, room_id: int, include_past: bool = False) -> int:
        query = db.query(Showtime).filter(Showtime.room_id == room_id)
        query = self._filter_future_only(query, include_past)
        return query.count()

    # -------------------- BULK DELETE --------------------
    def delete_many(self, db: Session, ids: List[int]) -> int:
        if not ids:
            return 0
        deleted = db.query(Showtime).filter(Showtime.id.in_(ids)).delete(synchronize_session=False)
        db.commit()
        return deleted