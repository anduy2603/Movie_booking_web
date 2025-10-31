from fastapi import FastAPI
from app.middleware.cors import setup_cors_middleware
from app.middleware.logging import LoggingMiddleware
from app.middleware.rate_limit import RateLimitMiddleware, AuthRateLimitMiddleware
from app.middleware.security import SecurityHeadersMiddleware, CORSSecurityMiddleware
from app.middleware.validation import RequestValidationMiddleware, IPWhitelistMiddleware
from app.config.settings import settings

def setup_middleware(app: FastAPI):
    """Cấu hình tất cả middleware cho ứng dụng"""
    
    # 1. CORS Middleware (phải đặt đầu tiên)
    setup_cors_middleware(app)
    
    # 2. Security Headers Middleware
    app.add_middleware(SecurityHeadersMiddleware)
    
    # 3. CORS Security Middleware
    app.add_middleware(CORSSecurityMiddleware)
    
    # 4. Request Validation Middleware
    app.add_middleware(RequestValidationMiddleware)
    
    # 5. IP Whitelist/Blacklist Middleware (nếu cần)
    if settings.IP_WHITELIST or settings.IP_BLACKLIST:
        app.add_middleware(
            IPWhitelistMiddleware,
            whitelist=settings.IP_WHITELIST,
            blacklist=settings.IP_BLACKLIST
        )
    
    # 6. Rate Limiting Middleware
    app.add_middleware(
        RateLimitMiddleware,
        calls=settings.RATE_LIMIT_CALLS,
        period=settings.RATE_LIMIT_PERIOD
    )
    
    # 7. Auth Rate Limiting Middleware
    app.add_middleware(
        AuthRateLimitMiddleware,
        calls=settings.AUTH_RATE_LIMIT_CALLS,
        period=settings.AUTH_RATE_LIMIT_PERIOD
    )
    
    # 8. Logging Middleware (cuối cùng để log tất cả)
    app.add_middleware(LoggingMiddleware)

def setup_production_middleware(app: FastAPI):
    """Cấu hình middleware cho production"""
    
    # CORS với origins cụ thể
    setup_cors_middleware(app)
    
    # Security headers
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(CORSSecurityMiddleware)
    
    # Request validation
    app.add_middleware(RequestValidationMiddleware)
    
    # Rate limiting nghiêm ngặt hơn
    app.add_middleware(
        RateLimitMiddleware,
        calls=50,  # 50 requests per minute
        period=60
    )
    
    app.add_middleware(
        AuthRateLimitMiddleware,
        calls=3,  # 3 auth attempts per 5 minutes
        period=300
    )
    
    # Logging
    app.add_middleware(LoggingMiddleware)

def setup_development_middleware(app: FastAPI):
    """Cấu hình middleware cho development"""
    
    # CORS cho phép tất cả
    setup_cors_middleware(app)
    
    # Security headers (ít nghiêm ngặt hơn)
    app.add_middleware(SecurityHeadersMiddleware)
    
    # Request validation (ít nghiêm ngặt hơn)
    app.add_middleware(RequestValidationMiddleware)
    
    # Rate limiting nhẹ (dùng giá trị từ settings để có thể tùy biến)
    app.add_middleware(
        RateLimitMiddleware,
        calls=settings.RATE_LIMIT_CALLS or 1000,
        period=settings.RATE_LIMIT_PERIOD or 60,
    )
    
    app.add_middleware(
        AuthRateLimitMiddleware,
        calls=settings.AUTH_RATE_LIMIT_CALLS or 1000,
        period=settings.AUTH_RATE_LIMIT_PERIOD or 60,
    )
    
    # Logging chi tiết
    app.add_middleware(LoggingMiddleware)
