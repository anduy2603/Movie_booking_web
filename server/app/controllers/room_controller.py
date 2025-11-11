from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.config.logger import logger
from app.schemas.room_schema import RoomCreate, RoomRead
from app.schemas.base_schema import PaginatedResponse, PaginationParams
from app.dependencies import get_pagination_params
from app.config.database import get_db
from app.services.room_service import RoomService
from app.repositories.room_repo import RoomRepository
from app.auth.permissions import requires_role
from fastapi import HTTPException

router = APIRouter(prefix="/rooms", tags=["Rooms"])
room_service = RoomService(RoomRepository())

# -------------------- GET ALL ROOMS (PAGINATED) --------------------
@router.get("/", response_model=PaginatedResponse[RoomRead])
def list_rooms(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params)
):
    logger.info(f"GET /rooms called: page={pagination.page}, size={pagination.size}")
    rooms, total = room_service.get_rooms_paginated(db, page=pagination.page, size=pagination.size)
    return PaginatedResponse[RoomRead](
        data=rooms,
        total=total,
        page=pagination.page,
        size=pagination.size,
        pages=(total + pagination.size - 1) // pagination.size
    )

# -------------------- GET ROOMS BY THEATER (PAGINATED) --------------------
@router.get("/theater/{theater_id}", response_model=PaginatedResponse[RoomRead])
def list_rooms_by_theater(
    theater_id: int,
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params)
):
    logger.info(f"GET /rooms/theater/{theater_id} called: page={pagination.page}, size={pagination.size}")
    rooms, total = room_service.get_rooms_by_theater_paginated(db, theater_id, page=pagination.page, size=pagination.size)
    return PaginatedResponse[RoomRead](
        data=rooms,
        total=total,
        page=pagination.page,
        size=pagination.size,
        pages=(total + pagination.size - 1) // pagination.size
    )

# -------------------- GET ROOM BY ID --------------------
@router.get("/{room_id}", response_model=RoomRead)
def get_room(room_id: int, db: Session = Depends(get_db)):
    logger.info(f"GET /rooms/{room_id} called")
    return room_service.get_room(db, room_id)

# -------------------- CREATE ROOM --------------------
@router.post("/", response_model=RoomRead, status_code=status.HTTP_201_CREATED, dependencies=[Depends(requires_role("admin"))])
def create_room(room_in: RoomCreate, db: Session = Depends(get_db)):
    logger.info(f"POST /rooms called with data: {room_in}")
    return room_service.create_room(db, room_in)

# -------------------- UPDATE ROOM --------------------
@router.put("/{room_id}", response_model=RoomRead, dependencies=[Depends(requires_role("admin"))])
def update_room(room_id: int, room_in: RoomCreate, db: Session = Depends(get_db)):
    logger.info(f"PUT /rooms/{room_id} called with data: {room_in}")
    return room_service.update_room(db, room_id, room_in)

# -------------------- DELETE ROOM --------------------
@router.delete("/{room_id}", dependencies=[Depends(requires_role("admin"))])
def delete_room(room_id: int, db: Session = Depends(get_db)):
    logger.info(f"DELETE /rooms/{room_id} called")
    return room_service.delete_room(db, room_id)

# -------------------- GENERATE SEATS --------------------
@router.post("/{room_id}/generate-seats", dependencies=[Depends(requires_role("admin"))])
def generate_seats(room_id: int, overwrite: bool = False, db: Session = Depends(get_db)):
    logger.info(f"POST /rooms/{room_id}/generate-seats called overwrite={overwrite}")
    return room_service.generate_seats(db, room_id, overwrite)
