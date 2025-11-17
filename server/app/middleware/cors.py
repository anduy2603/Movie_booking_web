from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings

def setup_cors_middleware(app: FastAPI):
    """Cấu hình CORS middleware từ settings"""
    
    # Sử dụng CORS_ORIGINS từ settings, fallback về defaults nếu không có
    allowed_origins = settings.CORS_ORIGINS if settings.CORS_ORIGINS else [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["*"]
    )
