from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.schemas.movie_schema import MovieCreate, MovieRead, MovieBase
from app.schemas.base_schema import PaginatedResponse
from app.config.database import get_db
from app.services.movie_service import MovieService
from app.repositories.movie_repo import MovieRepository
from app.auth.permissions import requires_role

router = APIRouter(prefix="/movies", tags=["Movies"])
movie_service = MovieService(MovieRepository())

@router.get("/", response_model=PaginatedResponse[MovieRead])
def get_all_movies(
    db: Session = Depends(get_db), 
    page: int = Query(1, ge=1, description="Current page number"),
    size: int = Query(10, ge=1, le=100, description="Number of items per page"),
    ):
    
    # Lấy danh sách movie theo phân trang
    movies, total = movie_service.get_movies_paginated(db, page=page, size=size)
    return PaginatedResponse[MovieRead](
        data=movies,
        total=total,
        page=page,
        size=size,
        pages=(total + size - 1) // size  # tính tổng số trang
    )
    

@router.get("/{movie_id}", response_model=MovieRead)
def get_movie_by_id(movie_id: int, db: Session = Depends(get_db)):
    return movie_service.get_movie_by_id(db, movie_id)

@router.post("/", response_model=MovieRead, status_code=status.HTTP_201_CREATED,dependencies=[Depends(requires_role("admin"))])
def create_movie(movie_data: MovieCreate, db: Session = Depends(get_db)):
    return movie_service.create_movie(db, movie_data)

@router.put("/{movie_id}", response_model=MovieRead, dependencies=[Depends(requires_role("admin"))])
def update_movie(movie_id: int, movie_data: MovieBase, db: Session = Depends(get_db)):
    return movie_service.update_movie(db, movie_id, movie_data)

@router.delete("/{movie_id}", response_model=MovieRead, dependencies=[Depends(requires_role("admin"))])
def delete_movie(movie_id: int, db: Session = Depends(get_db)):
    return movie_service.delete_movie(db, movie_id)
