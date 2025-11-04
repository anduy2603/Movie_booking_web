from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from app.models.movie import Movie
from app.repositories.base_repo import BaseRepository
from app.schemas.movie_schema import MovieCreate, MovieBase
from sqlalchemy import select, func, or_

class MovieRepository(BaseRepository[Movie, MovieCreate, MovieBase]):
    def __init__(self):
        super().__init__(Movie)

    def get_by_title(self, db: Session, title: str) -> Optional[Movie]:
        state = select(Movie).where(Movie.title == title)
        return db.scalar(state)

    def get_paginated(self, db: Session ,skip: int =0, limit: int = 10) -> Tuple[List[Movie], int]:
        # Lấy danh sách phim có phân trang và tổng số lượng phim 
        total = db.scalar(select(func.count()).select_from(Movie))
        state = select(Movie).offset(skip).limit(limit)
        movies = db.scalars(state).all()
        return movies, total 

    def get_with_likes(self, db: Session, skip : int = 0 , limit: int = 100 ) -> List[Movie]:
        """
        Lấy danh sách phim và đếm số lượng người like.
        """
        state = select(Movie).offset(skip).limit(limit)
        movies = db.scalars(state).all()
        for m in movies:
            m.liked_by = len(m.liked_by) if hasattr(m, "liked_by") else 0
        return movies

    def count(self, db: Session) -> int:
        """
        Đếm tổng số movie trong database.
        """
        return db.query(Movie).count()

    def search_movies(self, db: Session, query: str, skip: int = 0, limit: int = 10) -> Tuple[List[Movie], int]:
        """
        Tìm kiếm phim theo title, description, hoặc genre.
        """
        search_term = f"%{query.lower()}%"
        state = (
            select(Movie)
            .where(
                or_(
                    func.lower(Movie.title).like(search_term),
                    func.lower(Movie.description).like(search_term),
                    func.lower(Movie.genre).like(search_term)
                )
            )
            .offset(skip)
            .limit(limit)
        )
        movies = db.scalars(state).all()
        
        # Count total matching movies
        count_state = (
            select(func.count())
            .select_from(Movie)
            .where(
                or_(
                    func.lower(Movie.title).like(search_term),
                    func.lower(Movie.description).like(search_term),
                    func.lower(Movie.genre).like(search_term)
                )
            )
        )
        total = db.scalar(count_state) or 0
        
        return movies, total