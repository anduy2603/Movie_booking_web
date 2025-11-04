from fastapi import Request, FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from app.config.logger import logger
from app.config.settings import settings

def get_cors_headers(request: Request):
    """Helper để lấy CORS headers"""
    origin = request.headers.get("origin")
    if not origin:
        allowed_origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
        origin = allowed_origins[0] if allowed_origins else "*"
    
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Requested-With",
    }

def register_exception_handlers(app: FastAPI):
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        """Handle HTTPException và đảm bảo CORS headers được thêm vào"""
        headers = get_cors_headers(request)
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=headers
        )
    
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """Handle validation errors với CORS headers"""
        headers = get_cors_headers(request)
        return JSONResponse(
            status_code=422,
            content={"detail": exc.errors()},
            headers=headers
        )
    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
        logger.error(f"Database Error: {exc}", exc_info=True)
        headers = get_cors_headers(request)
        error_detail = str(exc) if settings.DEBUG else "Database Error"
        return JSONResponse(
            status_code=500, content={"detail": error_detail}, headers=headers
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled Error: {exc}", exc_info=True)
        headers = get_cors_headers(request)
        return JSONResponse(
            status_code=500, 
            content={"detail": str(exc) if settings.DEBUG else "Internal Server Error"}, 
            headers=headers
        )
