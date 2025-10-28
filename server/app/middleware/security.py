from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware để thêm các security headers"""
    
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
        except Exception:
            # Nếu có exception trong downstream, đảm bảo vẫn trả response
            # với header CORS/security cơ bản để browser không block preflight
            response = Response(content="Internal Server Error", status_code=500)
        
        # Security headers
        security_headers = {
            # Ngăn chặn clickjacking
            "X-Frame-Options": "DENY",
            
            # Ngăn chặn MIME type sniffing
            "X-Content-Type-Options": "nosniff",
            
            # XSS Protection
            "X-XSS-Protection": "1; mode=block",
            
            # Strict Transport Security (HTTPS only)
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            
            # Content Security Policy
            "Content-Security-Policy": (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; "
                "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com; "
                "img-src 'self' data: https:; "
                "font-src 'self' data: https:; "
                "connect-src 'self'; "
                "frame-ancestors 'none';"
            ),
            
            # Referrer Policy
            "Referrer-Policy": "strict-origin-when-cross-origin",
            
            # Permissions Policy
            "Permissions-Policy": (
                "geolocation=(), "
                "microphone=(), "
                "camera=(), "
                "payment=(), "
                "usb=(), "
                "magnetometer=(), "
                "gyroscope=(), "
                "speaker=()"
            ),
            
            # Cache Control cho sensitive endpoints
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        }
        
        # Thêm headers vào response
        for header, value in security_headers.items():
            response.headers[header] = value
        
        return response

class CORSSecurityMiddleware(BaseHTTPMiddleware):
    """Middleware để tăng cường bảo mật CORS"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Thêm CORS security headers
        cors_security_headers = {
            # Ngăn chặn preflight cache
            "Access-Control-Max-Age": "86400",  # 24 hours
            
            # Chỉ cho phép các headers cần thiết
            "Access-Control-Allow-Headers": (
                "Content-Type, Authorization, X-Requested-With, "
                "Accept, Origin, X-CSRF-Token"
            ),
            
            # Chỉ cho phép các methods cần thiết
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            
            # Không expose sensitive headers
            "Access-Control-Expose-Headers": (
                "X-Process-Time, X-RateLimit-Limit, "
                "X-RateLimit-Remaining, X-RateLimit-Reset"
            ),
        }
        
        # Thêm headers vào response
        for header, value in cors_security_headers.items():
            response.headers[header] = value

        # Đảm bảo Access-Control-Allow-Origin được set (fallback) —
        # một số trình duyệt/preflight có thể không nhận header nếu middleware khác
        # vô tình loại bỏ nó, vì vậy thêm fallback bằng origin của request.
        origin = request.headers.get("origin")
        if origin:
            response.headers.setdefault("Access-Control-Allow-Origin", origin)
        else:
            # Nếu không có origin, cho phép tất cả (development fallback)
            response.headers.setdefault("Access-Control-Allow-Origin", "*")

        # Cho phép credentials nếu client cần gửi cookie/token
        response.headers.setdefault("Access-Control-Allow-Credentials", "true")
        
        return response
