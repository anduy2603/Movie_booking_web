from sqlalchemy.orm import Session, selectinload
from sqlalchemy import insert, delete, select
from typing import List
from app.models.favorites import favorites
from app.models.movie import Movie
from app.models.user import User

class FavoriteRepository:
    def __init__(self):
        self.table = favorites

    def get_all(self, db: Session, skip: int = 0, limit: int = 100):
        stmt = select(self.table).offset(skip).limit(limit)
        return db.execute(stmt).fetchall()

    def get_user_favorites(self, db: Session, user_id: int) -> List[Movie]:
        """Lấy danh sách phim yêu thích của user với relationship loaded"""
        stmt = (
            select(Movie)
            .join(self.table, self.table.c.movie_id == Movie.id)
            .where(self.table.c.user_id == user_id)
            .options(selectinload(Movie.liked_by))  # Eager load relationship để tính liked_by_count
        )
        return db.execute(stmt).scalars().all()

    def add_favorite(self, db: Session, user_id: int, movie_id: int):
        stmt = insert(self.table).values(user_id=user_id, movie_id=movie_id)
        db.execute(stmt)
        db.commit()

    def remove_favorite(self, db: Session, user_id: int, movie_id: int):
        stmt = delete(self.table).where(
            self.table.c.user_id == user_id,
            self.table.c.movie_id == movie_id
        )
        db.execute(stmt)
        db.commit()

    def exists(self, db: Session, user_id: int, movie_id: int) -> bool:
        stmt = (
            select(self.table)
            .where(
                self.table.c.user_id == user_id,
                self.table.c.movie_id == movie_id
            )
        )
        return db.execute(stmt).first() is not None
