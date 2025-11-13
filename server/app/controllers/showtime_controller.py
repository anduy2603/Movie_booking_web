from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.config.database import get_db
from app.schemas.showtime_schema import ShowtimeCreate, ShowtimeRead, ShowtimeBase
from app.services.showtime_service import ShowtimeService
from app.repositories.showtime_repo import ShowtimeRepository
from app.schemas.base_schema import PaginatedResponse, PaginationParams, create_paginated_response
from app.dependencies import get_pagination_params
from app.auth.permissions import requires_role
from pydantic import BaseModel

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
    pagination: PaginationParams = Depends(get_pagination_params),
):
    showtimes, total = showtime_service.get_paginated(db, pagination.page, pagination.size)
    return create_paginated_response(showtimes, total, pagination)


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
    pagination: PaginationParams = Depends(get_pagination_params),
):
    showtimes, total = showtime_service.get_paginated_by_movie(db, movie_id, pagination.page, pagination.size)
    return create_paginated_response(showtimes, total, pagination)


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


# -------------------- BULK DELETE --------------------
class IdsPayload(BaseModel):
    ids: List[int]

@router.post("/batch-delete", dependencies=[Depends(requires_role("admin"))])
def batch_delete_showtimes(payload: IdsPayload, db: Session = Depends(get_db)):
    deleted = showtime_service.delete_many(db, payload.ids or [])
    return {"deleted": deleted}
