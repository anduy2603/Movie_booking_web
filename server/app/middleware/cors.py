from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings

def setup_cors_middleware(app: FastAPI):
    """Cấu hình CORS middleware"""
    
    # Danh sách origins được phép
    allowed_origins = [
        "http://localhost:3000",  # React dev server
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        # Thêm production domains khi deploy
        # "https://yourdomain.com",
    ]
    
    # Trong development, cho phép tất cả origins
    if settings.DEBUG:
        allowed_origins = ["*"]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["*"]
    )
