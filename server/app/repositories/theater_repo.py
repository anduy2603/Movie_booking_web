from app.models.theater import Theater
from app.repositories.base_repo import BaseRepository
from app.schemas.theater_schema import TheaterCreate, TheaterBase

class TheaterRepository(BaseRepository[Theater, TheaterCreate, TheaterBase]):
    def __init__(self):
        super().__init__(Theater)
