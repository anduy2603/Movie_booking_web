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
    
    # Luôn dùng danh sách origin cụ thể để đảm bảo header CORS xuất hiện cả với DELETE/4xx/5xx
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["*"]
    )
