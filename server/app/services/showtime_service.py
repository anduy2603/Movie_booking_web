from sqlalchemy.orm import Session
from typing import List, Tuple, Optional
from datetime import timezone
from fastapi import HTTPException, status
from app.services.base_service import BaseService
from app.models.showtime import Showtime
from app.repositories.showtime_repo import ShowtimeRepository
from app.schemas.showtime_schema import ShowtimeCreate, ShowtimeBase
from app.config.logger import logger


class ShowtimeService(BaseService[Showtime, ShowtimeCreate, ShowtimeBase]):
    def __init__(self, showtime_repo: Optional[ShowtimeRepository] = None):
        super().__init__(showtime_repo or ShowtimeRepository(), service_name="ShowtimeService")

    # -------------------- CUSTOM GET METHODS --------------------
    def get_by_movie(self, db: Session, movie_id: int) -> List[Showtime]:
        return self.repository.get_by_movie(db, movie_id)

    def get_by_room(self, db: Session, room_id: int) -> List[Showtime]:
        return self.repository.get_by_room(db, room_id)

    def get_paginated(self, db: Session, page: int = 1, size: int = 10) -> Tuple[List[Showtime], int]:
        total = self.repository.count_all(db)
        showtimes = self.repository.get_paginated(db, offset=(page - 1) * size, limit=size)
        return showtimes, total

    def get_paginated_by_movie(self, db: Session, movie_id: int, page: int = 1, size: int = 10) -> Tuple[List[Showtime], int]:
        total = self.repository.count_by_movie(db, movie_id)
        showtimes = self.repository.get_paginated_by_movie(db, movie_id, offset=(page - 1) * size, limit=size)
        return showtimes, total

    def get_paginated_by_room(self, db: Session, room_id: int, page: int = 1, size: int = 10) -> Tuple[List[Showtime], int]:
        total = self.repository.count_by_room(db, room_id)
        showtimes = self.repository.get_paginated_by_room(db, room_id, offset=(page - 1) * size, limit=size)
        return showtimes, total

    # -------------------- VALIDATION --------------------
    def validate_conflict(self, db: Session, room_id: int, start_time, end_time):
        """Kiểm tra xem có trùng giờ chiếu trong cùng phòng không (so sánh trực tiếp theo DB)."""
        # Chuẩn hóa về naive UTC-like lưu trong DB: nếu có tz thì chuyển sang UTC và bỏ tz; nếu không có tz thì giữ nguyên
        def to_naive_utc(dt):
            if dt.tzinfo is None:
                return dt
            return dt.astimezone(timezone.utc).replace(tzinfo=None)

        s_start = to_naive_utc(start_time)
        s_end = to_naive_utc(end_time)

        conflict = (
            db.query(Showtime)
            .filter(
                Showtime.room_id == room_id,
                Showtime.start_time < s_end,
                Showtime.end_time > s_start,
            )
            .first()
        )
        if conflict:
            logger.warning(
                f"Conflict detected: Room {room_id} overlaps with showtime id={conflict.id}"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Showtime conflict with showtime id={conflict.id}"
            )

    # -------------------- CREATE OVERRIDE --------------------
    def create(self, db: Session, obj_in: ShowtimeCreate) -> Showtime:
        # Normalize to naive for conflict check and storage
        start_naive_utc = (obj_in.start_time.astimezone(timezone.utc) if obj_in.start_time.tzinfo else obj_in.start_time).replace(tzinfo=None)
        end_naive_utc = (obj_in.end_time.astimezone(timezone.utc) if obj_in.end_time.tzinfo else obj_in.end_time).replace(tzinfo=None)
        self.validate_conflict(db, obj_in.room_id, start_naive_utc, end_naive_utc)
        obj_in = obj_in.model_copy(update={"start_time": start_naive_utc, "end_time": end_naive_utc})
        return super().create(db, obj_in)

    # -------------------- UPDATE OVERRIDE --------------------
    def update(self, db: Session, obj_id: int, obj_in: ShowtimeBase) -> Showtime:
        db_obj = db.query(Showtime).get(obj_id)
        if not db_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Showtime not found")
        # Determine target values (support partial update)
        new_room_id = obj_in.room_id if hasattr(obj_in, 'room_id') and obj_in.room_id is not None else db_obj.room_id
        new_start = obj_in.start_time if hasattr(obj_in, 'start_time') and obj_in.start_time is not None else db_obj.start_time
        new_end = obj_in.end_time if hasattr(obj_in, 'end_time') and obj_in.end_time is not None else db_obj.end_time
        # Normalize to naive and validate conflict excluding itself
        start_naive = (new_start.astimezone(timezone.utc) if getattr(new_start, 'tzinfo', None) else new_start).replace(tzinfo=None)
        end_naive = (new_end.astimezone(timezone.utc) if getattr(new_end, 'tzinfo', None) else new_end).replace(tzinfo=None)
        conflict = (
            db.query(Showtime)
            .filter(
                Showtime.id != obj_id,
                Showtime.room_id == new_room_id,
                Showtime.start_time < end_naive,
                Showtime.end_time > start_naive,
            )
            .first()
        )
        if conflict:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Showtime conflict with showtime id={conflict.id}")
        # Apply updates
        payload = obj_in.model_dump(exclude_unset=True)
        if 'start_time' in payload:
            payload['start_time'] = start_naive
        if 'end_time' in payload:
            payload['end_time'] = end_naive
        for k, v in payload.items():
            setattr(db_obj, k, v)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    # -------------------- BULK DELETE --------------------
    def delete_many(self, db: Session, ids: List[int]) -> int:
        return self.repository.delete_many(db, ids)