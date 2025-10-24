from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from app.config.logger import logger

def register_exception_handlers(app: FastAPI):
    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        logger.error(f"Database Error: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500, content={"detail": "Database Error"}
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled Error: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500, content={"detail": "Internal Server Error"}
        )
