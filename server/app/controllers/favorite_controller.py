from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.repositories.favorite_repo import FavoriteRepository
from app.services.favorite_service import FavoriteService
from app.schemas.favorite_schema import FavoriteCreate
from app.schemas.movie_schema import MovieRead
from typing import List
from app.models.user import User
from app.auth.permissions import get_current_user

router = APIRouter(prefix="/favorites", tags=["Favorites"])

favorite_service = FavoriteService(FavoriteRepository())

@router.get("/user/{user_id}", response_model=List[MovieRead])
def get_user_favorites(
    user_id: int, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy danh sách phim yêu thích của user"""
    # Admin có thể xem favorite của bất kỳ user nào, user chỉ xem favorite của mình
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only view your own favorites")
    
    return favorite_service.get_user_favorites(db, user_id)

@router.post("/toggle")
def toggle_favorite(
    favorite: FavoriteCreate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Thêm hoặc xóa phim khỏi danh sách yêu thích"""
    # User chỉ có thể toggle favorite cho chính mình
    if current_user.id != favorite.user_id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only manage your own favorites")
    
    return favorite_service.toggle_favorite(db, favorite.user_id, favorite.movie_id)
