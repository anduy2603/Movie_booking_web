from typing import Optional
from app.services.base_service import BaseService
from app.repositories.theater_repo import TheaterRepository
from app.models.theater import Theater
from app.schemas.theater_schema import TheaterCreate, TheaterBase

class TheaterService(BaseService[Theater, TheaterCreate, TheaterBase]):
    def __init__(self, repository: Optional[TheaterRepository] = None):
        super().__init__(repository or TheaterRepository(), service_name="TheaterService")
