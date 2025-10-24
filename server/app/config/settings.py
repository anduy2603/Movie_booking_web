from pydantic_settings import BaseSettings
from typing import Any, List, Optional, Dict
import os

class JWSData:
    token: str
    type: str
    expires_in: int
    expires_at: int
    issued_at: int
    jwt_id: str
    nonce: str
    algorithm: str
    header: dict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Movie Booking"
    DATABASE_URL: str = "sqlite:///./movie_booking.db"

    # Security Settings - MUST be overridden in .env for production
    SECRET_KEY: str = "CHANGE_THIS_IN_PRODUCTION"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # JWT Settings - MUST be overridden in .env for production
    JWT_SECRET_KEY: str = "CHANGE_THIS_IN_PRODUCTION"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Password Settings
    PASSWORD_MIN_LENGTH: int = 8
    PASSWORD_REQUIRE_UPPERCASE: bool = True
    PASSWORD_REQUIRE_LOWERCASE: bool = True
    PASSWORD_REQUIRE_NUMBERS: bool = True
    PASSWORD_REQUIRE_SPECIAL_CHARS: bool = True
    
    # Rate Limiting
    RATE_LIMIT_CALLS: int = 100
    RATE_LIMIT_PERIOD: int = 60  # seconds
    AUTH_RATE_LIMIT_CALLS: int = 50
    AUTH_RATE_LIMIT_PERIOD: int = 60  # seconds
    
    # IP Whitelist/Blacklist
    IP_WHITELIST: Optional[List[str]] = None
    IP_BLACKLIST: Optional[List[str]] = None
    
    # CORS Settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    # File Upload Settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = ["image/jpeg", "image/png", "image/gif"]
    
    # Database Settings
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 3600
    
    # Logging Settings
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: str = "app.log"
    
    # Email Settings (for future use)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_USE_TLS: bool = True
    
    # Redis Settings (for caching and sessions)
    REDIS_URL: Optional[str] = None
    REDIS_PASSWORD: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Security check for production
        if self.ENVIRONMENT == "production":
            self._validate_production_secrets()
    
    def _validate_production_secrets(self):
        """Validate that production secrets are properly set"""
        if self.SECRET_KEY in ["CHANGE_THIS_IN_PRODUCTION", "your-secret-key-change-in-production"]:
            raise ValueError("SECRET_KEY must be changed for production!")
        if self.JWT_SECRET_KEY in ["CHANGE_THIS_IN_PRODUCTION", "your-jwt-secret-key-change-in-production"]:
            raise ValueError("JWT_SECRET_KEY must be changed for production!")
        if self.DEBUG:
            raise ValueError("DEBUG must be False for production!")

settings = Settings()