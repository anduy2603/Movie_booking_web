# 🚀 Hướng dẫn Test Server Authentication

## ✅ Server đã chạy thành công!

**URL:** http://localhost:8000  
**API Docs:** http://localhost:8000/docs

## 🔐 Auth Endpoints có sẵn

### **1. Đăng ký (Register)**
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "username": "johndoe"  // optional
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "full_name": "John Doe",
    "role": "customer",
    "is_active": true,
    "is_verified": false
  }
}
```

### **2. Đăng nhập (Login)**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Tương tự như register

### **3. Lấy thông tin user hiện tại**
```bash
GET /auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

### **4. Cập nhật profile**
```bash
PUT /auth/me
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "full_name": "John Smith",
  "username": "johnsmith"
}
```

### **5. Đổi mật khẩu**
```bash
POST /auth/change-password
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "current_password": "password123",
  "new_password": "newpassword456"
}
```

### **6. Đăng xuất**
```bash
POST /auth/logout
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🧪 Test với PowerShell

### **Test 1: Đăng ký user mới**
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
    full_name = "Test User"
    username = "testuser"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### **Test 2: Đăng nhập**
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:8000/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = ($response.Content | ConvertFrom-Json).access_token
```

### **Test 3: Lấy thông tin user**
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-WebRequest -Uri "http://localhost:8000/auth/me" -Method GET -Headers $headers
```

## 🌐 Test với Browser

1. **Mở API Docs:** http://localhost:8000/docs
2. **Tìm section "Authentication"**
3. **Test các endpoints:**
   - POST `/auth/register`
   - POST `/auth/login`
   - GET `/auth/me`
   - PUT `/auth/me`
   - POST `/auth/change-password`
   - POST `/auth/logout`

## 🔧 Cấu hình JWT

**File:** `server/app/config/settings.py`

```python
# JWT Settings
JWT_SECRET_KEY: str = "your-jwt-secret-key-change-in-production"
JWT_ALGORITHM: str = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
```

**Tạo file `.env` trong `server/`:**
```env
JWT_SECRET_KEY=your-super-secret-key-here
DEBUG=true
```

## 🛡️ Protected Routes

### **User Routes (cần authentication):**
- `GET /users/me` - Thông tin user hiện tại
- `PUT /users/{user_id}` - Cập nhật user (chỉ admin hoặc chính mình)
- `DELETE /users/{user_id}` - Xóa user (chỉ admin hoặc chính mình)

### **Admin Routes (cần role admin):**
- `POST /users/` - Tạo user mới
- `GET /users/` - Danh sách users
- `GET /users/{user_id}` - Chi tiết user
- `GET /users/email/{email}` - Tìm user theo email

## 🎯 Test Flow hoàn chỉnh

1. **Đăng ký user mới**
2. **Đăng nhập để lấy token**
3. **Sử dụng token để gọi protected endpoints**
4. **Test đổi mật khẩu**
5. **Test cập nhật profile**
6. **Test logout**

## 🚨 Troubleshooting

### **Lỗi 401 Unauthorized:**
- Kiểm tra token có đúng format `Bearer TOKEN`
- Kiểm tra token có hết hạn không
- Kiểm tra JWT_SECRET_KEY có đúng không

### **Lỗi 403 Forbidden:**
- Kiểm tra user có đủ quyền không
- Kiểm tra role-based access

### **Lỗi 422 Validation Error:**
- Kiểm tra format JSON
- Kiểm tra required fields
- Kiểm tra password requirements

## 🎉 Kết luận

**Server authentication đã hoạt động hoàn hảo với:**
- ✅ JWT token authentication
- ✅ Password hashing với bcrypt
- ✅ Role-based access control
- ✅ Protected routes
- ✅ User management
- ✅ API documentation tại `/docs`

**Sẵn sàng kết nối với frontend!** 🚀
