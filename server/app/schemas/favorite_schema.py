from pydantic import BaseModel

class FavoriteBase(BaseModel):
    user_id: int
    movie_id: int

class FavoriteCreate(FavoriteBase):
    pass

class FavoriteRead(FavoriteBase):
    pass
