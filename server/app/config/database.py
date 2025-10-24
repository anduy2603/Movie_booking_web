
from app.config.settings import settings
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

DATABASE_URL = settings.DATABASE_URL

# Tuỳ chọn connect_args chỉ áp dụng cho SQLite
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}, #dùng cho sqlite
    echo=True 
    )

SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
    )



# Dependency để inject vào routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()