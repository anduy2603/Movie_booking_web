from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.services.base_service import BaseService
from app.repositories.movie_repo import MovieRepository
from app.models.movie import Movie
from app.schemas.movie_schema import MovieCreate, MovieBase, MovieRead

class MovieService(BaseService[Movie, MovieCreate, MovieBase]):
    def __init__(self, repo: Optional[MovieRepository] = None):
        super().__init__(repository=repo or MovieRepository(), service_name="MovieService")

    # def get_movies(self, db: Session):
    #     return self.repo.get_with_likes(db)

    # get movie phân trang 
    def get_movies_paginated(self, db: Session, page: int = 1, size: int = 10) -> Tuple[List[MovieRead], int]:
        skip = (page - 1) * size 
        movies, total = self.repository.get_paginated(db, skip=skip, limit=size)
        for movie in movies: 
            movie.liked_by_count = len(movie.liked_by) if hasattr(movie, "liked_by") else 0
        return movies, total

    # get movie by id 
    def get_movie_by_id(self, db: Session, movie_id: int):
        movie = self.repository.get_by_id(db, movie_id)
        if not movie:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")
        movie.liked_by_count = len(movie.liked_by) if hasattr(movie, "liked_by") else 0
        return movie

    def create_movie(self, db: Session, data: MovieCreate):
        existing = self.repository.get_by_title(db, data.title)
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Movie already exists")
        return self.repository.create(db, data)

    def update_movie(self, db: Session, movie_id: int, data: MovieBase):
        movie = self.repository.get_by_id(db, movie_id)
        if not movie:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")
        return self.repository.update(db, movie, data)

    def delete_movie(self, db: Session, movie_id: int):
        movie = self.repository.delete(db, movie_id)
        if not movie:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Movie not found")
        return movie
