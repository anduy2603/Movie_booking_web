from sqlalchemy.orm import Session
from typing import List, Tuple, Optional
from fastapi import HTTPException
from app.services.base_service import BaseService
from app.repositories.room_repo import RoomRepository
from app.models.room import Room
from app.schemas.room_schema import RoomCreate, RoomRead, RoomBase
from app.config.logger import logger

class RoomService(BaseService[Room, RoomCreate, RoomBase]):
    def __init__(self, room_repo: Optional[RoomRepository] = None):
        super().__init__(repository=room_repo or RoomRepository(), service_name="RoomService")

    def create_room(self, db: Session, room_in: RoomCreate) -> RoomRead:
        logger.info(f"Creating room '{room_in.name}' in theater {room_in.theater_id}")
        room = self.repository.create(db, room_in)
        logger.info(f"Room created successfully: id={room.id}")
        return room

    def get_room(self, db: Session, room_id: int) -> RoomRead:
        logger.info(f"Fetching room id={room_id}")
        room = self.repository.get_by_id(db, room_id)
        if not room:
            logger.warning(f"Room id={room_id} not found")
            raise HTTPException(status_code=404, detail="Room not found")
        return room

    def get_all_rooms(self, db: Session) -> List[RoomRead]:
        logger.info("Fetching all rooms")
        return self.repository.get_all(db)

    def get_rooms_by_theater(self, db: Session, theater_id: int) -> List[RoomRead]:
        logger.info(f"Fetching rooms for theater_id={theater_id}")
        return self.repository.get_by_theater(db, theater_id)

    def get_rooms_paginated(self, db: Session, page: int = 1, size: int = 10) -> Tuple[List[RoomRead], int]:
        logger.info(f"Fetching paginated rooms: page={page}, size={size}")
        total = self.repository.count_all(db)
        rooms = self.repository.get_paginated(db, offset=(page-1)*size, limit=size)
        logger.info(f"Fetched {len(rooms)} rooms out of total {total}")
        return rooms, total

    def get_rooms_by_theater_paginated(self, db: Session, theater_id: int, page: int = 1, size: int = 10) -> Tuple[List[RoomRead], int]:
        logger.info(f"Fetching paginated rooms for theater_id={theater_id}: page={page}, size={size}")
        total = self.repository.count_by_theater(db, theater_id)
        rooms = self.repository.get_paginated_by_theater(db, theater_id, offset=(page-1)*size, limit=size)
        logger.info(f"Fetched {len(rooms)} rooms out of total {total} for theater {theater_id}")
        return rooms, total

    def update_room(self, db: Session, room_id: int, room_in: RoomBase) -> RoomRead:
        logger.info(f"Updating room id={room_id}")
        db_room = self.repository.get_by_id(db, room_id)
        if not db_room:
            logger.warning(f"Room id={room_id} not found for update")
            raise HTTPException(status_code=404, detail="Room not found")
        for field, value in room_in.dict(exclude_unset=True).items():
            setattr(db_room, field, value)
        db.commit()
        db.refresh(db_room)
        logger.info(f"Room id={room_id} updated successfully")
        return db_room

    def delete_room(self, db: Session, room_id: int):
        logger.info(f"Deleting room id={room_id}")
        deleted = self.repository.delete(db, room_id)
        if not deleted:
            logger.warning(f"Room id={room_id} not found for deletion")
            raise HTTPException(status_code=404, detail="Room not found")
        logger.info(f"Room id={room_id} deleted successfully")
        return {"message": "Room deleted successfully"}
