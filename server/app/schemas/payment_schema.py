from datetime import datetime
from typing import Optional
from pydantic import Field, validator
from .base_schema import BaseSchema

class PaymentBase(BaseSchema):
    method: str = Field(..., description="Payment method (momo, zalopay, visa, cash, etc.)")
    amount: float = Field(..., gt=0, description="Payment amount must be positive")
    status: str = Field(default="pending", description="Payment status")

    @validator('method')
    def validate_method(cls, v):
        """Validate payment method"""
        valid_methods = ['momo', 'zalopay', 'visa', 'mastercard', 'cash', 'bank_transfer']
        v_lower = v.lower()
        if v_lower not in valid_methods:
            # Cho phép các method khác nhưng cảnh báo
            return v
        return v_lower

    @validator('status')
    def validate_status(cls, v):
        """Validate payment status"""
        valid_statuses = ['pending', 'success', 'failed', 'cancelled', 'refunded']
        if v not in valid_statuses:
            raise ValueError(f'status must be one of: {valid_statuses}')
        return v

class PaymentCreate(PaymentBase):
    method: str
    amount: float
    created_by: int

class PaymentRead(PaymentBase):
    id: int
    created_at: datetime
    created_by: Optional[int] = None
