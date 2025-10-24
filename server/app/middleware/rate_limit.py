import time
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict, deque

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware để giới hạn số lượng request"""
    
    def __init__(self, app, calls: int = 100, period: int = 60):
        super().__init__(app)
        self.calls = calls  # Số lượng request cho phép
        self.period = period  # Thời gian tính bằng giây
        self.requests: Dict[str, deque] = defaultdict(deque)
    
    async def dispatch(self, request: Request, call_next):
        # Lấy IP của client
        client_ip = request.client.host if request.client else "unknown"
        
        # Lấy thời gian hiện tại
        current_time = time.time()
        
        # Làm sạch các request cũ
        self._clean_old_requests(client_ip, current_time)
        
        # Kiểm tra số lượng request
        if len(self.requests[client_ip]) >= self.calls:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded: {self.calls} requests per {self.period} seconds"
            )
        
        # Thêm request mới
        self.requests[client_ip].append(current_time)
        
        # Process request
        response = await call_next(request)
        
        # Thêm rate limit headers
        remaining = self.calls - len(self.requests[client_ip])
        response.headers["X-RateLimit-Limit"] = str(self.calls)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(current_time + self.period))
        
        return response
    
    def _clean_old_requests(self, client_ip: str, current_time: float):
        """Xóa các request cũ hơn period"""
        while (self.requests[client_ip] and 
               current_time - self.requests[client_ip][0] > self.period):
            self.requests[client_ip].popleft()

class AuthRateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting riêng cho auth endpoints"""
    
    def __init__(self, app, calls: int = 5, period: int = 300):  # 5 calls per 5 minutes
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.requests: Dict[str, deque] = defaultdict(deque)
    
    async def dispatch(self, request: Request, call_next):
        # Chỉ áp dụng cho auth endpoints
        if not request.url.path.startswith("/auth/"):
            return await call_next(request)
        
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Làm sạch các request cũ
        self._clean_old_requests(client_ip, current_time)
        
        # Kiểm tra số lượng request
        if len(self.requests[client_ip]) >= self.calls:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Auth rate limit exceeded: {self.calls} requests per {self.period} seconds"
            )
        
        # Thêm request mới
        self.requests[client_ip].append(current_time)
        
        # Process request
        response = await call_next(request)
        
        # Thêm rate limit headers
        remaining = self.calls - len(self.requests[client_ip])
        response.headers["X-Auth-RateLimit-Limit"] = str(self.calls)
        response.headers["X-Auth-RateLimit-Remaining"] = str(remaining)
        response.headers["X-Auth-RateLimit-Reset"] = str(int(current_time + self.period))
        
        return response
    
    def _clean_old_requests(self, client_ip: str, current_time: float):
        """Xóa các request cũ hơn period"""
        while (self.requests[client_ip] and 
               current_time - self.requests[client_ip][0] > self.period):
            self.requests[client_ip].popleft()
