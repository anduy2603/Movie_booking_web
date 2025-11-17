from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Any, List, Optional, Dict
from secrets import token_urlsafe
from app.config.logger import logger

DEFAULT_SECRET_VALUES = {
    "",
    "CHANGE_THIS_IN_PRODUCTION",
    "your-secret-key",
    "your-secret-key-change-in-production",
    "your-jwt-secret-key",
    "your-jwt-secret-key-change-in-production",
}

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
    PROJECT_NAME: str = Field(default="Movie Booking", env="PROJECT_NAME")
    DATABASE_URL: str = Field(default="sqlite:///./movie_booking.db", env="DATABASE_URL")

    # Security Settings - MUST be overridden in .env for production
    SECRET_KEY: str = Field(default="CHANGE_THIS_IN_PRODUCTION", env="SECRET_KEY")
    DEBUG: bool = Field(default=False, env="DEBUG")
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    
    # JWT Settings - MUST be overridden in .env for production
    JWT_SECRET_KEY: str = Field(default="CHANGE_THIS_IN_PRODUCTION", env="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, env="JWT_REFRESH_TOKEN_EXPIRE_DAYS")
    
    # Password Settings
    PASSWORD_MIN_LENGTH: int = Field(default=8, env="PASSWORD_MIN_LENGTH")
    PASSWORD_REQUIRE_UPPERCASE: bool = Field(default=True, env="PASSWORD_REQUIRE_UPPERCASE")
    PASSWORD_REQUIRE_LOWERCASE: bool = Field(default=True, env="PASSWORD_REQUIRE_LOWERCASE")
    PASSWORD_REQUIRE_NUMBERS: bool = Field(default=True, env="PASSWORD_REQUIRE_NUMBERS")
    PASSWORD_REQUIRE_SPECIAL_CHARS: bool = Field(default=True, env="PASSWORD_REQUIRE_SPECIAL_CHARS")
    
    # Rate Limiting
    RATE_LIMIT_CALLS: int = Field(default=1000, env="RATE_LIMIT_CALLS")
    RATE_LIMIT_PERIOD: int = Field(default=60, env="RATE_LIMIT_PERIOD")  # seconds
    AUTH_RATE_LIMIT_CALLS: int = Field(default=100, env="AUTH_RATE_LIMIT_CALLS")
    AUTH_RATE_LIMIT_PERIOD: int = Field(default=60, env="AUTH_RATE_LIMIT_PERIOD")  # seconds
    
    # IP Whitelist/Blacklist
    IP_WHITELIST: Optional[List[str]] = Field(default=None, env="IP_WHITELIST")
    IP_BLACKLIST: Optional[List[str]] = Field(default=None, env="IP_BLACKLIST")
    
    # CORS Settings
    CORS_ORIGINS: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
        ],
        env="CORS_ORIGINS",
    )
    
    # File Upload Settings
    MAX_FILE_SIZE: int = Field(default=10 * 1024 * 1024, env="MAX_FILE_SIZE")  # 10MB
    ALLOWED_FILE_TYPES: List[str] = Field(default=["image/jpeg", "image/png", "image/gif"], env="ALLOWED_FILE_TYPES")
    
    # Database Settings
    DB_POOL_SIZE: int = Field(default=10, env="DB_POOL_SIZE")
    DB_MAX_OVERFLOW: int = Field(default=20, env="DB_MAX_OVERFLOW")
    DB_POOL_TIMEOUT: int = Field(default=30, env="DB_POOL_TIMEOUT")
    DB_POOL_RECYCLE: int = Field(default=3600, env="DB_POOL_RECYCLE")
    
    # Logging Settings
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(default="%(asctime)s - %(name)s - %(levelname)s - %(message)s", env="LOG_FORMAT")
    LOG_FILE: str = Field(default="app.log", env="LOG_FILE")
    
    # Email Settings (for future use)
    SMTP_HOST: Optional[str] = Field(default=None, env="SMTP_HOST")
    SMTP_PORT: Optional[int] = Field(default=None, env="SMTP_PORT")
    SMTP_USERNAME: Optional[str] = Field(default=None, env="SMTP_USERNAME")
    SMTP_PASSWORD: Optional[str] = Field(default=None, env="SMTP_PASSWORD")
    SMTP_USE_TLS: bool = Field(default=True, env="SMTP_USE_TLS")
    
    # Redis Settings (for caching and sessions)
    REDIS_URL: Optional[str] = Field(default=None, env="REDIS_URL")
    REDIS_PASSWORD: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._ensure_security_defaults()
        if self.ENVIRONMENT == "production":
            self._validate_production_secrets()
    
    def _ensure_security_defaults(self):
        """Apply safe defaults and warnings for missing secrets."""
        if not self.DATABASE_URL or self.DATABASE_URL in {"your-database-url", ""}:
            if self.ENVIRONMENT == "production":
                raise ValueError("DATABASE_URL must be set for production!")
            self.DATABASE_URL = "sqlite:///./movie_booking.db"
            logger.warning("DATABASE_URL not set. Falling back to local SQLite database.")

        if self.SECRET_KEY in DEFAULT_SECRET_VALUES:
            if self.ENVIRONMENT == "production":
                raise ValueError("SECRET_KEY must be set to a secure value in production!")
            self.SECRET_KEY = token_urlsafe(32)
            logger.warning("Generated temporary SECRET_KEY for development. Please set SECRET_KEY in your .env file.")

        if self.JWT_SECRET_KEY in DEFAULT_SECRET_VALUES:
            if self.ENVIRONMENT == "production":
                raise ValueError("JWT_SECRET_KEY must be set to a secure value in production!")
            self.JWT_SECRET_KEY = token_urlsafe(32)
            logger.warning("Generated temporary JWT_SECRET_KEY for development. Please set JWT_SECRET_KEY in your .env file.")

        if self.ENVIRONMENT == "production" and self.DEBUG:
            raise ValueError("DEBUG must be False for production!")
    
    def _validate_production_secrets(self):
        """Validate that production secrets are properly set"""
        if self.SECRET_KEY in DEFAULT_SECRET_VALUES:
            raise ValueError("SECRET_KEY must be changed for production!")
        if self.JWT_SECRET_KEY in DEFAULT_SECRET_VALUES:
            raise ValueError("JWT_SECRET_KEY must be changed for production!")
        if self.DEBUG:
            raise ValueError("DEBUG must be False for production!")

settings = Settings()