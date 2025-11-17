
from app.config.settings import settings
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine, event

DATABASE_URL = settings.DATABASE_URL

def _is_sqlite(url: str) -> bool:
    return url.startswith("sqlite")

def _build_engine():
    base_args = {
        "echo": bool(settings.DEBUG),
    }

    if _is_sqlite(DATABASE_URL):
        base_args["connect_args"] = {"check_same_thread": False}
    else:
        base_args.update({
            "pool_size": settings.DB_POOL_SIZE,
            "max_overflow": settings.DB_MAX_OVERFLOW,
            "pool_timeout": settings.DB_POOL_TIMEOUT,
            "pool_recycle": settings.DB_POOL_RECYCLE,
        })

    return create_engine(DATABASE_URL, **base_args)

engine = _build_engine()

if _is_sqlite(DATABASE_URL):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        try:
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()
        except Exception:
            pass

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()