from datetime import datetime
from typing import Optional
from .base_schema import BaseSchema

class PaymentBase(BaseSchema):
    method: str
    amount: float
    status: str = "pending"

class PaymentCreate(PaymentBase):
    method: str
    amount: float
    created_by: int

class PaymentRead(PaymentBase):
    id: int
    created_at: datetime
    created_by: Optional[int] = None
