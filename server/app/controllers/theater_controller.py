from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.config.database import get_db
from app.schemas.theater_schema import TheaterCreate, TheaterRead
from app.services.theater_service import TheaterService
from app.repositories.theater_repo import TheaterRepository
from app.schemas.base_schema import PaginatedResponse, get_pagination_params, PaginationParams
from app.auth.permissions import requires_role

router = APIRouter(prefix="/theaters", tags=["Theaters"])

theater_service = TheaterService(TheaterRepository())

@router.get("/", response_model=PaginatedResponse[TheaterRead])
def get_theaters(
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params)
):
    skip = (pagination.page - 1) * pagination.size
    theaters = theater_service.get_all(db, skip=skip, limit=pagination.size)
    total = theater_service.repository.count(db)
    pages = (total + pagination.size - 1) // pagination.size
    return PaginatedResponse(
        data=theaters,
        total=total,
        page=pagination.page,
        size=pagination.size,
        pages=pages
    )

@router.get("/{theater_id}", response_model=TheaterRead)
def get_theater(theater_id: int, db: Session = Depends(get_db)):
    theater = theater_service.get(db, theater_id)
    if not theater:
        raise HTTPException(status_code=404, detail="Theater not found")
    return theater

@router.post("/", response_model=TheaterRead, dependencies=[Depends(requires_role("admin"))])
def create_theater(theater_in: TheaterCreate, db: Session = Depends(get_db)):
    return theater_service.create(db, theater_in)

@router.put("/{theater_id}", response_model=TheaterRead, dependencies=[Depends(requires_role("admin"))])
def update_theater(theater_id: int, theater_in: TheaterCreate, db: Session = Depends(get_db)):
    return theater_service.update(db, theater_id, theater_in)

@router.delete("/{theater_id}", response_model=TheaterRead, dependencies=[Depends(requires_role("admin"))])
def delete_theater(theater_id: int, db: Session = Depends(get_db)):
    return theater_service.delete(db, theater_id)
