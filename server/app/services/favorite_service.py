from app.repositories.favorite_repo import FavoriteRepository
from fastapi import HTTPException
from sqlalchemy.orm import Session

class FavoriteService:
    def __init__(self, repo: FavoriteRepository):
        self.repo = repo

    def get_user_favorites(self, db: Session, user_id: int):
        """Lấy danh sách phim yêu thích của user và tính liked_by_count cho mỗi phim"""
        movies = self.repo.get_user_favorites(db, user_id)
        # Tính liked_by_count cho mỗi movie (giống như trong movie_service)
        for movie in movies:
            movie.liked_by_count = len(movie.liked_by) if hasattr(movie, "liked_by") and movie.liked_by else 0
        return movies

    def toggle_favorite(self, db: Session, user_id: int, movie_id: int):
        exists = self.repo.exists(db, user_id, movie_id)
        if exists:
            self.repo.remove_favorite(db, user_id, movie_id)
            return {"message": "Removed from favorites"}
        else:
            self.repo.add_favorite(db, user_id, movie_id)
            return {"message": "Added to favorites"}
