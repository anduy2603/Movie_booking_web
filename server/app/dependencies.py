
from fastapi import Query, Depends
from app.schemas.base_schema import PaginationParams


def get_pagination_params(
    page: int = Query(1, ge=1, description="Current page number"),
    size: int = Query(10, ge=1, le=100, description="Number of items per page")
) -> PaginationParams:
    """
    Dependency function để lấy pagination params từ query string.
    
    Sử dụng trong controllers:
        pagination: PaginationParams = Depends(get_pagination_params)
    """
    return PaginationParams(page=page, size=size)

