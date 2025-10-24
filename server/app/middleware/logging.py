import time
import logging
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.config.logger import logger

class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware để log các request và response"""
    
    async def dispatch(self, request: Request, call_next):
        # Log request
        start_time = time.time()
        
        # Lấy thông tin request
        method = request.method
        url = str(request.url)
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        # Log request info
        logger.info(
            f"Request: {method} {url} - "
            f"IP: {client_ip} - "
            f"User-Agent: {user_agent}"
        )
        
        # Process request
        try:
            response = await call_next(request)
            
            # Calculate processing time
            process_time = time.time() - start_time
            
            # Log response info
            logger.info(
                f"Response: {response.status_code} - "
                f"Time: {process_time:.4f}s - "
                f"Method: {method} - "
                f"URL: {url}"
            )
            
            # Add processing time to response headers
            response.headers["X-Process-Time"] = str(process_time)
            
            return response
            
        except Exception as e:
            # Log error
            process_time = time.time() - start_time
            logger.error(
                f"Error: {str(e)} - "
                f"Time: {process_time:.4f}s - "
                f"Method: {method} - "
                f"URL: {url}"
            )
            raise
