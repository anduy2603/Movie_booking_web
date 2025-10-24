# Hướng dẫn Bảo mật cho MovieBooking API

## 1. Middleware đã được thêm

### ✅ CORS Middleware (`cors.py`)
- Cấu hình Cross-Origin Resource Sharing
- Chỉ cho phép origins được phép
- Hỗ trợ credentials và các methods cần thiết

### ✅ Logging Middleware (`logging.py`)
- Log tất cả requests và responses
- Theo dõi thời gian xử lý
- Log errors và exceptions
- Thêm header `X-Process-Time`

### ✅ Rate Limiting Middleware (`rate_limit.py`)
- **RateLimitMiddleware**: Giới hạn 100 requests/phút
- **AuthRateLimitMiddleware**: Giới hạn 5 auth attempts/5 phút
- Thêm headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### ✅ Security Headers Middleware (`security.py`)
- **SecurityHeadersMiddleware**: Thêm các security headers
- **CORSSecurityMiddleware**: Tăng cường bảo mật CORS

### ✅ Request Validation Middleware (`validation.py`)
- **RequestValidationMiddleware**: Validate request và ngăn chặn attacks
- **IPWhitelistMiddleware**: Whitelist/blacklist IP addresses

## 2. Security Headers được thêm

```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ...
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=(), ...
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
```

## 3. Rate Limiting

### General API
- **100 requests/phút** cho mỗi IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Auth Endpoints
- **5 attempts/5 phút** cho login/register
- Headers: `X-Auth-RateLimit-Limit`, `X-Auth-RateLimit-Remaining`, `X-Auth-RateLimit-Reset`

## 4. Request Validation

### Ngăn chặn các patterns nguy hiểm:
- XSS: `<script>`, `javascript:`, `onload=`, `onerror=`
- SQL Injection: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `UNION`
- Command Injection: `eval(`, `exec(`, `system(`, `cmd`
- File Inclusion: `<?php`, `<%`

### Giới hạn kích thước request:
- **10MB** cho request body
- Kiểm tra Content-Length header

## 5. Cấu hình Settings

### Security Settings
```python
SECRET_KEY = "your-secret-key-change-in-production"
JWT_SECRET_KEY = "your-jwt-secret-key-change-in-production"
DEBUG = True  # Set to False in production
```

### Rate Limiting Settings
```python
RATE_LIMIT_CALLS = 100
RATE_LIMIT_PERIOD = 60
AUTH_RATE_LIMIT_CALLS = 5
AUTH_RATE_LIMIT_PERIOD = 300
```

### Password Requirements
```python
PASSWORD_MIN_LENGTH = 8
PASSWORD_REQUIRE_UPPERCASE = True
PASSWORD_REQUIRE_LOWERCASE = True
PASSWORD_REQUIRE_NUMBERS = True
PASSWORD_REQUIRE_SPECIAL_CHARS = True
```

## 6. Cách sử dụng

### Development
```python
# Trong main.py
setup_middleware(app)  # Sử dụng cấu hình development
```

### Production
```python
# Trong main.py
setup_production_middleware(app)  # Sử dụng cấu hình production nghiêm ngặt hơn
```

## 7. Environment Variables

Tạo file `.env` với các cấu hình:

```env
# Security
SECRET_KEY=your-super-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
DEBUG=false
ENVIRONMENT=production

# Rate Limiting
RATE_LIMIT_CALLS=50
AUTH_RATE_LIMIT_CALLS=3

# IP Security
IP_WHITELIST=192.168.1.1,10.0.0.1
IP_BLACKLIST=192.168.1.100

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## 8. Monitoring và Logging

### Log Files
- `app.log` - Application logs
- `logs/app.log` - Detailed logs

### Log Format
```
2024-01-01 12:00:00 - app.middleware.logging - INFO - Request: GET /movies - IP: 192.168.1.1 - User-Agent: Mozilla/5.0...
2024-01-01 12:00:01 - app.middleware.logging - INFO - Response: 200 - Time: 0.0234s - Method: GET - URL: http://localhost:8000/movies
```

## 9. Testing Security

### Test Rate Limiting
```bash
# Test general rate limit
for i in {1..101}; do curl -X GET "http://localhost:8000/movies"; done

# Test auth rate limit
for i in {1..6}; do curl -X POST "http://localhost:8000/auth/login" -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"wrong"}'; done
```

### Test Security Headers
```bash
curl -I "http://localhost:8000/movies"
# Kiểm tra các security headers trong response
```

## 10. Production Checklist

- [ ] Thay đổi `SECRET_KEY` và `JWT_SECRET_KEY`
- [ ] Set `DEBUG=false`
- [ ] Set `ENVIRONMENT=production`
- [ ] Cấu hình `CORS_ORIGINS` với domains thực
- [ ] Cấu hình `IP_WHITELIST` nếu cần
- [ ] Sử dụng HTTPS
- [ ] Cấu hình firewall
- [ ] Monitor logs
- [ ] Backup database
- [ ] Test rate limiting
- [ ] Test security headers
