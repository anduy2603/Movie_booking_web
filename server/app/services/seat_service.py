from sqlalchemy.orm import Session
from typing import List, Tuple, Optional
from fastapi import HTTPException

from app.services.base_service import BaseService
from app.repositories.seat_repo import SeatRepository
from app.models.seat import Seat
from app.schemas.seat_schema import SeatCreate, SeatRead, SeatBase
from app.config.logger import logger


class SeatService(BaseService[Seat, SeatCreate, SeatBase]):
    def __init__(self, seat_repo: Optional[SeatRepository] = None):
        super().__init__(repository=seat_repo or SeatRepository(), service_name="SeatService")

    # -------------------- GET BY ROOM --------------------
    def get_seats_by_room(self, db: Session, room_id: int) -> List[SeatRead]:
        """
        Lấy danh sách tất cả các ghế thuộc 1 phòng cụ thể.
        """
        logger.info(f"[SeatService] Fetching seats by room_id={room_id}")
        return self.repository.get_by_room(db, room_id)

    def get_all_seats(self, db: Session) -> List[SeatRead]:
        """
        Lấy toàn bộ ghế (không phân trang).
        """
        return self.repository.get_all(db, skip=0, limit=0)

    # -------------------- PAGINATION --------------------
    def get_seats_paginated(self, db: Session, page: int = 1, size: int = 10) -> Tuple[List[SeatRead], int]:
        """
        Phân trang toàn bộ ghế trong hệ thống.
        """
        total = self.repository.count_all(db)
        seats = self.repository.get_paginated(db, offset=(page - 1) * size, limit=size)
        logger.info(f"[SeatService] Returning {len(seats)} seats (page={page}/{(total // size) + 1})")
        return seats, total

    def get_seats_by_room_paginated(self, db: Session, room_id: int, page: int = 1, size: int = 10) -> Tuple[List[SeatRead], int]:
        """
        Phân trang ghế theo phòng (room_id).
        """
        total = self.repository.count_by_room(db, room_id)
        seats = self.repository.get_paginated_by_room(db, room_id, offset=(page - 1) * size, limit=size)
        logger.info(f"[SeatService] Returning {len(seats)} seats in room_id={room_id} (page={page}/{(total // size) + 1})")
        return seats, total

    # -------------------- DELETE OVERRIDE --------------------
    def delete_seat(self, db: Session, seat_id: int):
        """
        Xóa ghế theo ID (override để thêm log + xử lý lỗi rõ ràng hơn).
        """
        deleted = self.repository.delete(db, seat_id)
        if not deleted:
            logger.warning(f"[SeatService] Cannot delete — Seat id={seat_id} not found")
            raise HTTPException(status_code=404, detail="Seat not found")
        logger.info(f"[SeatService] Seat id={seat_id} deleted successfully")
        return {"message": "Seat deleted successfully"}

    def get_by_id(self, db: Session, seat_id: int) -> Optional[Seat]:
        return self.repository.get_by_id(db, seat_id)
