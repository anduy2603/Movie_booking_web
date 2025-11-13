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

# Schema cho pagination query params
class PaginationParams(BaseModel):
    """Schema chung cho pagination query parameters"""
    model_config = ConfigDict(from_attributes=True)
    
    page: int = Field(1, ge=1, description="Current page number")
    size: int = Field(10, ge=1, le=100, description="Number of items per page")

# Helper function để tạo PaginatedResponse từ data, total và pagination
def create_paginated_response(
    data: List[T],
    total: int,
    pagination: PaginationParams
) -> PaginatedResponse[T]:
    """
    Helper function để tạo PaginatedResponse, tự động tính pages và lấy page/size từ pagination.
    
    Sử dụng trong controllers:
        return create_paginated_response(items, total, pagination)
    
    Thay vì:
        return PaginatedResponse[T](
            data=items,
            total=total,
            page=pagination.page,
            size=pagination.size,
            pages=(total + pagination.size - 1) // pagination.size
        )
    """
    pages = (total + pagination.size - 1) // pagination.size if pagination.size > 0 else 0
    return PaginatedResponse[T](
        data=data,
        total=total,
        page=pagination.page,
        size=pagination.size,
        pages=pages
    )