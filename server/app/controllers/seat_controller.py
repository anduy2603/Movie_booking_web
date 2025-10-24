from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.config.database import get_db
from app.schemas.seat_schema import SeatCreate, SeatRead, SeatBase
from app.services.seat_service import SeatService
from app.repositories.seat_repo import SeatRepository
from app.auth.permissions import requires_role

router = APIRouter(prefix="/seats", tags=["Seats"])

# Khởi tạo service với repository
seat_service = SeatService(SeatRepository())


# -------------------- CREATE --------------------
@router.post("/", response_model=SeatRead, dependencies=[Depends(requires_role("admin"))])
def create_seat(seat_in: SeatCreate, db: Session = Depends(get_db)):
    """
    Tạo mới một ghế trong phòng cụ thể.
    """
    return seat_service.create(db, seat_in)


# -------------------- READ --------------------
@router.get("/{seat_id}", response_model=SeatRead)
def get_seat(seat_id: int, db: Session = Depends(get_db)):
    """
    Lấy thông tin chi tiết của 1 ghế theo ID.
    """
    seat = seat_service.get_by_id(db, seat_id)
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not found")
    return seat


@router.get("/", response_model=List[SeatRead])
def get_all_seats(db: Session = Depends(get_db)):
    """
    Lấy toàn bộ danh sách ghế
    """
    return seat_service.get_all_seats(db)


@router.get("/room/{room_id}", response_model=List[SeatRead])
def get_seats_by_room(room_id: int, db: Session = Depends(get_db)):
    """
    Lấy danh sách ghế trong một phòng cụ thể 
    """
    return seat_service.get_seats_by_room(db, room_id)


# -------------------- UPDATE --------------------
@router.put("/{seat_id}", response_model=SeatRead, dependencies=[Depends(requires_role("admin"))])
def update_seat(seat_id: int, seat_in: SeatBase, db: Session = Depends(get_db)):
    """
    Cập nhật thông tin ghế (loại ghế, hàng, số, ...).
    """
    updated = seat_service.update(db, seat_id, seat_in)
    if not updated:
        raise HTTPException(status_code=404, detail="Seat not found")
    return updated


# -------------------- DELETE --------------------
@router.delete("/{seat_id}", dependencies=[Depends(requires_role("admin"))])
def delete_seat(seat_id: int, db: Session = Depends(get_db)):
    """
    Xóa một ghế theo ID.
    """
    return seat_service.delete_seat(db, seat_id)
