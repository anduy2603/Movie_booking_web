import json
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

class RequestValidationMiddleware(BaseHTTPMiddleware):
    """Middleware để validate request và ngăn chặn các attack cơ bản"""
    
    def __init__(self, app, max_content_length: int = 10 * 1024 * 1024):  # 10MB
        super().__init__(app)
        self.max_content_length = max_content_length
        
        # Danh sách các patterns nguy hiểm
        self.dangerous_patterns = [
            "<script",
            "javascript:",
            "vbscript:",
            "onload=",
            "onerror=",
            "onclick=",
            "eval(",
            "expression(",
            "url(",
            "import ",
            "exec(",
            "system(",
            "cmd",
            "powershell",
            "bash",
            "sh ",
            "&&",
            "||",
            "`",
            "$(",
            "<?php",
            "<%",
            "SELECT ",
            "INSERT ",
            "UPDATE ",
            "DELETE ",
            "DROP ",
            "UNION ",
            "OR 1=1",
            "AND 1=1",
        ]
    
    async def dispatch(self, request: Request, call_next):
        # Kiểm tra Content-Length
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.max_content_length:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"Request too large. Maximum size: {self.max_content_length} bytes"
            )
        
        # Kiểm tra User-Agent
        user_agent = request.headers.get("user-agent", "").lower()
        if any(pattern in user_agent for pattern in ["bot", "crawler", "spider", "scraper"]):
            # Có thể log hoặc block các bot không mong muốn
            pass
        
        # Kiểm tra URL parameters
        if self._contains_dangerous_patterns(str(request.url)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid request parameters"
            )
        
        # Kiểm tra request body cho POST/PUT/PATCH
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                # Đọc body để kiểm tra
                body = await request.body()
                
                # Kiểm tra kích thước body
                if len(body) > self.max_content_length:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="Request body too large"
                    )
                
                # Kiểm tra nội dung body
                if self._contains_dangerous_patterns(body.decode("utf-8", errors="ignore")):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid request content"
                    )
                
                # Tạo lại request với body đã đọc
                async def receive():
                    return {"type": "http.request", "body": body}
                
                request._receive = receive
                
            except UnicodeDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid request encoding"
                )
        
        # Process request
        response = await call_next(request)
        
        return response
    
    def _contains_dangerous_patterns(self, content: str) -> bool:
        """Kiểm tra xem content có chứa patterns nguy hiểm không"""
        content_lower = content.lower()
        return any(pattern.lower() in content_lower for pattern in self.dangerous_patterns)

class IPWhitelistMiddleware(BaseHTTPMiddleware):
    """Middleware để whitelist IP addresses"""
    
    def __init__(self, app, whitelist: list = None, blacklist: list = None):
        super().__init__(app)
        self.whitelist = whitelist or []
        self.blacklist = blacklist or []
    
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        
        # Kiểm tra blacklist
        if self.blacklist and client_ip in self.blacklist:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Kiểm tra whitelist (nếu có)
        if self.whitelist and client_ip not in self.whitelist:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return await call_next(request)
