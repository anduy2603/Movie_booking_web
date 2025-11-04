from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.payment import Payment
from app.repositories.base_repo import BaseRepository
from app.schemas.payment_schema import PaymentCreate, PaymentBase

class PaymentRepository(BaseRepository[Payment, PaymentCreate, PaymentBase]):
    def __init__(self):
        super().__init__(Payment)

    def get_by_user(self, db: Session, user_id: int) -> List[Payment]:
        """Lấy tất cả payments của một user"""
        return db.query(Payment).filter(Payment.created_by == user_id).all()

    def get_by_status(self, db: Session, status: str) -> List[Payment]:
        """Lấy payments theo status"""
        return db.query(Payment).filter(Payment.status == status).all()

