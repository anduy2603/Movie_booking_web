from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.config.database import get_db
from app.services.payment_service import PaymentService
from app.repositories.payment_repo import PaymentRepository
from app.schemas.payment_schema import PaymentCreate, PaymentRead
from app.models.user import User
from app.auth.permissions import get_current_user, requires_role
from app.config import logger

router = APIRouter(prefix="/payments", tags=["Payments"])
payment_service = PaymentService()

@router.post("/", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment_data: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tạo payment mới (user chỉ có thể tạo payment cho chính mình)"""
    try:
        logger.info(f"Creating payment for user {current_user.id}: method={payment_data.method}, amount={payment_data.amount}")
        
        if payment_data.created_by != current_user.id:
            raise HTTPException(status_code=403, detail="Forbidden: You can only create payments for yourself")
        
        payment = payment_service.create_payment(db, payment_data)
        logger.info(f"Payment {payment.id} created successfully")
        return payment
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating payment: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create payment: {str(e)}")

@router.get("/me", response_model=List[PaymentRead])
def get_my_payments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy tất cả payments của user hiện tại"""
    return payment_service.get_user_payments(db, current_user.id)

@router.get("/", response_model=List[PaymentRead], dependencies=[Depends(requires_role("admin"))])
def get_all_payments(db: Session = Depends(get_db)):
    """Lấy tất cả payments (admin only)"""
    return payment_service.get_all(db)

@router.get("/{payment_id}", response_model=PaymentRead)
def get_payment_by_id(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy payment theo ID (admin hoặc chính chủ)"""
    payment = payment_service.get_by_id(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if current_user.role != "admin" and payment.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only view your own payments")
    
    return payment

@router.put("/{payment_id}/status", response_model=PaymentRead)
def update_payment_status(
    payment_id: int,
    new_status: str = Query(..., description="New payment status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cập nhật status của payment (admin hoặc chính chủ)"""
    payment = payment_service.get_by_id(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if current_user.role != "admin" and payment.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: You can only update your own payments")
    
    valid_statuses = ["pending", "success", "failed", "cancelled"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    return payment_service.update_payment_status(db, payment_id, new_status)

