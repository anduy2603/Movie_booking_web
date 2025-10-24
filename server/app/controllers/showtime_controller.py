from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.schemas.showtime_schema import ShowtimeCreate, ShowtimeRead, ShowtimeBase
from app.services.showtime_service import ShowtimeService
from app.repositories.showtime_repo import ShowtimeRepository
from app.schemas.base_schema import PaginatedResponse
from app.auth.permissions import requires_role

router = APIRouter(prefix="/showtimes", tags=["Showtimes"])
showtime_service = ShowtimeService(ShowtimeRepository())


# -------------------- CREATE --------------------
@router.post("/", response_model=ShowtimeRead, dependencies=[Depends(requires_role("admin"))])
def create_showtime(showtime_in: ShowtimeCreate, db: Session = Depends(get_db)):
    return showtime_service.create(db, showtime_in)


# -------------------- GET ALL (pagination optional) --------------------
@router.get("/", response_model=PaginatedResponse[ShowtimeRead])
def get_all_showtimes(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
):
    showtimes, total = showtime_service.get_paginated(db, page, size)
    return PaginatedResponse(
        data=showtimes,
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size
    )


# -------------------- GET BY ID --------------------
@router.get("/{showtime_id}", response_model=ShowtimeRead)
def get_showtime(showtime_id: int, db: Session = Depends(get_db)):
    showtime = showtime_service.get(db, showtime_id)
    if not showtime:
        raise HTTPException(status_code=404, detail="Showtime not found")
    return showtime


# -------------------- GET BY MOVIE --------------------
@router.get("/movie/{movie_id}", response_model=PaginatedResponse[ShowtimeRead])
def get_showtimes_by_movie(
    movie_id: int,
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
):
    showtimes, total = showtime_service.get_paginated_by_movie(db, movie_id, page, size)
    return PaginatedResponse(
        data=showtimes,
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size
    )


# -------------------- UPDATE --------------------
@router.put("/{showtime_id}", response_model=ShowtimeRead, dependencies=[Depends(requires_role("admin"))])
def update_showtime(showtime_id: int, showtime_in: ShowtimeBase, db: Session = Depends(get_db)):
    return showtime_service.update(db, showtime_id, showtime_in)


# -------------------- DELETE --------------------
@router.delete("/{showtime_id}", dependencies=[Depends(requires_role("admin"))])
def delete_showtime(showtime_id: int, db: Session = Depends(get_db)):
    deleted = showtime_service.delete(db, showtime_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Showtime not found")
    return {"message": "Showtime deleted successfully"}
