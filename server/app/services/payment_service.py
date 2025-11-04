from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.services.base_service import BaseService
from app.repositories.payment_repo import PaymentRepository
from app.models.payment import Payment
from app.schemas.payment_schema import PaymentCreate, PaymentBase, PaymentRead
from app.config.logger import logger

class PaymentService(BaseService[Payment, PaymentCreate, PaymentBase]):
    def __init__(self, repository: Optional[PaymentRepository] = None):
        super().__init__(repository=repository or PaymentRepository(), service_name="PaymentService")

    def create_payment(self, db: Session, payment_data: PaymentCreate) -> PaymentRead:
        """Tạo payment mới"""
        try:
            logger.info(f"Creating payment: method={payment_data.method}, amount={payment_data.amount}, created_by={payment_data.created_by}")
            
            # Validate user exists
            from app.models.user import User
            user = db.get(User, payment_data.created_by)
            if not user:
                logger.error(f"User {payment_data.created_by} not found")
                raise HTTPException(status_code=404, detail=f"User {payment_data.created_by} not found")
            
            payment = self.repository.create(db, payment_data)
            logger.info(f"Payment {payment.id} created successfully")
            return payment
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating payment: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to create payment: {str(e)}")

    def update_payment_status(self, db: Session, payment_id: int, new_status: str) -> PaymentRead:
        """Cập nhật status của payment"""
        payment = self.repository.get_by_id(db, payment_id)
        if not payment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
        
        payment.status = new_status
        db.commit()
        db.refresh(payment)
        logger.info(f"Payment {payment_id} status updated to {new_status}")
        return payment

    def get_user_payments(self, db: Session, user_id: int) -> List[PaymentRead]:
        """Lấy tất cả payments của user"""
        payments = self.repository.get_by_user(db, user_id)
        return payments

    def get_all(self, db: Session) -> List[PaymentRead]:
        """Lấy tất cả payments"""
        return self.repository.get_all(db)

