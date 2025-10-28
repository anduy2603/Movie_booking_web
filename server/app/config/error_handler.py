from fastapi import Request, FastAPI
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from app.config.logger import logger

def register_exception_handlers(app: FastAPI):
    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        logger.error(f"Database Error: {exc}", exc_info=True)
        # Ensure CORS headers are present on error responses so browsers
        # don't block them during development when preflight occurs.
        origin = request.headers.get("origin") or "*"
        headers = {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
        }
        return JSONResponse(
            status_code=500, content={"detail": "Database Error"}, headers=headers
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled Error: {exc}", exc_info=True)
        origin = request.headers.get("origin") or "*"
        headers = {
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
        }
        return JSONResponse(
            status_code=500, content={"detail": "Internal Server Error"}, headers=headers
        )
