from typing import Generic, TypeVar, Type, List, Optional
from sqlalchemy.orm import Session
from app.models.base_model import Base
from pydantic import BaseModel
from app.config import logger

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model
        self.model_name = model.__name__

    def get_by_id(self, db: Session, id: int) -> Optional[ModelType]:
        logger.info(f"[{self.model_name}Repository] Get by ID={id}")
        return db.get(self.model, id)

    # Compatibility with services expecting `get`
    def get(self, db: Session, id: int) -> Optional[ModelType]:
        return self.get_by_id(db, id)

    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[ModelType]:
        logger.info(f"[{self.model_name}Repository] Get all records (skip={skip}, limit={limit})")
        query = db.query(self.model)
        if skip:
            query = query.offset(skip)
        if limit:
            query = query.limit(limit)
        return query.all()

    def create(self, db: Session, data: CreateSchemaType) -> ModelType:
        logger.info(f"[{self.model_name}Repository] Creating record: {data}")
        try:
            # Use model_dump(exclude_unset=False) to include all fields, even with defaults
            data_dict = data.model_dump(exclude_unset=False)
            obj = self.model(**data_dict)
            db.add(obj)
            db.commit()
            db.refresh(obj)
            logger.info(f"[{self.model_name}Repository] Created record ID={obj.id}")
            return obj
        except Exception as e:
            db.rollback()
            logger.error(f"[{self.model_name}Repository] Error creating record: {e}")
            raise

    def update(self, db: Session, obj: ModelType, data: UpdateSchemaType) -> ModelType:
        logger.info(f"[{self.model_name}Repository] Updating ID={obj.id}")
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(obj, field, value)
        db.commit()
        db.refresh(obj)
        logger.info(f"[{self.model_name}Repository] Updated record ID={obj.id}")
        return obj

    def delete(self, db: Session, id: int) -> Optional[ModelType]:
        logger.info(f"[{self.model_name}Repository] Deleting ID={id}")
        obj = db.get(self.model, id)
        if obj:
            db.delete(obj)
            db.commit()
            logger.info(f"[{self.model_name}Repository] Deleted ID={id}")
        else:
            logger.warning(f"[{self.model_name}Repository] Not found ID={id}")
        return obj

    def count(self, db: Session) -> int:
        """Count total records for this model."""
        return db.query(self.model).count()