from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.config.logger import logger
from app.schemas.room_schema import RoomCreate, RoomRead
from app.schemas.base_schema import PaginatedResponse
from app.config.database import get_db
from app.services.room_service import RoomService
from app.repositories.room_repo import RoomRepository
from app.auth.permissions import requires_role

router = APIRouter(prefix="/rooms", tags=["Rooms"])
room_service = RoomService(RoomRepository())

# -------------------- GET ALL ROOMS (PAGINATED) --------------------
@router.get("/", response_model=PaginatedResponse[RoomRead])
def list_rooms(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Current page number"),
    size: int = Query(10, ge=1, le=100, description="Number of items per page")
):
    logger.info(f"GET /rooms called: page={page}, size={size}")
    rooms, total = room_service.get_rooms_paginated(db, page=page, size=size)
    return PaginatedResponse[RoomRead](
        data=rooms,
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size
    )

# -------------------- GET ROOMS BY THEATER (PAGINATED) --------------------
@router.get("/theater/{theater_id}", response_model=PaginatedResponse[RoomRead])
def list_rooms_by_theater(
    theater_id: int,
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100)
):
    logger.info(f"GET /rooms/theater/{theater_id} called: page={page}, size={size}")
    rooms, total = room_service.get_rooms_by_theater_paginated(db, theater_id, page=page, size=size)
    return PaginatedResponse[RoomRead](
        data=rooms,
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size
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
