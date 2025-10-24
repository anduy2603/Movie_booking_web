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
        """Kiểm tra xem có trùng giờ chiếu trong cùng phòng không"""
        def to_utc_aware(dt):
            if dt.tzinfo is None:
                return dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)

        s_start_utc = to_utc_aware(start_time)
        s_end_utc = to_utc_aware(end_time)

        existing = self.repository.get_by_room(db, room_id)
        for s in existing:
            e_start_utc = to_utc_aware(s.start_time)
            e_end_utc = to_utc_aware(s.end_time)
            if not (s_end_utc <= e_start_utc or s_start_utc >= e_end_utc):
                logger.warning(f"Conflict detected: Room {room_id} has overlap with showtime {s.id}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Showtime conflict with showtime id={s.id}"
                )

    # -------------------- CREATE OVERRIDE --------------------
    def create(self, db: Session, obj_in: ShowtimeCreate) -> Showtime:
        # Normalize to UTC-aware for conflict check
        self.validate_conflict(db, obj_in.room_id, obj_in.start_time, obj_in.end_time)
        # Store as naive UTC for consistency with DB naive DateTime columns
        start_naive_utc = (obj_in.start_time.astimezone(timezone.utc) if obj_in.start_time.tzinfo else obj_in.start_time).replace(tzinfo=None)
        end_naive_utc = (obj_in.end_time.astimezone(timezone.utc) if obj_in.end_time.tzinfo else obj_in.end_time).replace(tzinfo=None)
        obj_in = obj_in.model_copy(update={"start_time": start_naive_utc, "end_time": end_naive_utc})
        return super().create(db, obj_in)
