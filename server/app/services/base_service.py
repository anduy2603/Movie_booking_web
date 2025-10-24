from typing import Generic, TypeVar, List, Optional
from sqlalchemy.orm import Session
from app.repositories.base_repo import BaseRepository
from app.models.base_model import Base
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.config.logger import logger

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, repository: BaseRepository, service_name: str = None):
        self.repository = repository
        self.service_name = service_name or self.__class__.__name__

    def handle_exception(self, exc: Exception):
        if isinstance(exc, SQLAlchemyError):
            logger.error(f"[{self.service_name}] Database error: {exc}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error occurred"
            )
        else:
            logger.error(f"[{self.service_name}] Unexpected error: {exc}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error"
            )

    def get(self, db: Session, id: int) -> Optional[ModelType]:
        try:
            logger.info(f"[{self.service_name}] get(id={id}) called")
            return self.repository.get(db, id)
        except Exception as e:
            self.handle_exception(e)

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[ModelType]:
        try:
            logger.info(f"[{self.service_name}] get_all(skip={skip}, limit={limit}) called")
            return self.repository.get_all(db, skip, limit)
        except Exception as e:
            self.handle_exception(e)

    def create(self, db: Session, obj_in: CreateSchemaType) -> ModelType:
        try:
            logger.info(f"[{self.service_name}] create() called with data: {obj_in}")
            return self.repository.create(db, obj_in)
        except Exception as e:
            self.handle_exception(e)

    def update(self, db: Session, id: int, obj_in: UpdateSchemaType) -> Optional[ModelType]:
        try:
            db_obj = self.repository.get(db, id)
            if not db_obj:
                raise HTTPException(status_code=404, detail="Item not found")
            logger.info(f"[{self.service_name}] update(id={id}) called")
            return self.repository.update(db, db_obj, obj_in)
        except Exception as e:
            self.handle_exception(e)

    def delete(self, db: Session, id: int) -> Optional[ModelType]:
        try:
            logger.info(f"[{self.service_name}] delete(id={id}) called")
            return self.repository.delete(db, id)
        except Exception as e:
            self.handle_exception(e)
