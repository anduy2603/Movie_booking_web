from typing import Generic, List, TypeVar, Optional
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

# BaseSchema
class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True) 
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# Generic type
T = TypeVar("T")

# Schema phân trang
class PaginatedResponse(BaseSchema, Generic[T]):
    data: List[T] = Field(..., description="Danh sách item")
    total: int = Field(..., description="Tổng số item")
    page: int = Field(..., description="Số trang hiện tại")
    size: int = Field(..., description="Số item trên 1 trang")
    pages: int = Field(..., description="Tổng số trang")