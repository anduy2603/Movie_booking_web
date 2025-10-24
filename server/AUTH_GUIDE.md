# Hệ thống Authentication cho MovieBooking API

## Tổng quan

Dự án này hỗ trợ **2 phương thức authentication**:

1. **Clerk Authentication** - Cho UI (Frontend)
2. **JWT Authentication** - Cho API (Backend tự quản lý)

## 1. Clerk Authentication (UI)

### Cấu hình
- Clerk được sử dụng cho UI đăng ký/đăng nhập
- Endpoint: `/users/me` (chỉ cần xác thực)
- Tự động tạo user khi đăng nhập lần đầu

### Sử dụng
```javascript
// Frontend sử dụng Clerk
const { user } = useUser();
const token = await getToken();
```

## 2. JWT Authentication (API)

### Endpoints mới
- `POST /auth/register` - Đăng ký user mới
- `POST /auth/login` - Đăng nhập
- `POST /auth/change-password` - Đổi mật khẩu
- `GET /auth/me` - Lấy thông tin user hiện tại

### Sử dụng JWT Auth

#### Đăng ký
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

#### Đăng nhập
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Sử dụng token
```bash
curl -X GET "http://localhost:8000/auth/me" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 3. Authorization (Phân quyền)

### Roles
- `admin` - Quản trị viên (toàn quyền)
- `customer` - Khách hàng (quyền hạn chế)

### Endpoints yêu cầu Admin
- `POST /movies` - Tạo phim
- `PUT /movies/{id}` - Cập nhật phim
- `DELETE /movies/{id}` - Xóa phim
- `POST /theaters` - Tạo rạp
- `PUT /theaters/{id}` - Cập nhật rạp
- `DELETE /theaters/{id}` - Xóa rạp
- `POST /rooms` - Tạo phòng
- `PUT /rooms/{id}` - Cập nhật phòng
- `DELETE /rooms/{id}` - Xóa phòng
- `POST /seats` - Tạo ghế
- `PUT /seats/{id}` - Cập nhật ghế
- `DELETE /seats/{id}` - Xóa ghế
- `POST /showtimes` - Tạo suất chiếu
- `PUT /showtimes/{id}` - Cập nhật suất chiếu
- `DELETE /showtimes/{id}` - Xóa suất chiếu
- `GET /users` - Xem danh sách user
- `GET /users/{id}` - Xem chi tiết user
- `POST /users` - Tạo user mới
- `GET /bookings` - Xem tất cả booking

### Endpoints cho User (Admin hoặc chính chủ)
- `PUT /users/{id}` - Cập nhật thông tin (admin hoặc chính chủ)
- `DELETE /users/{id}` - Xóa tài khoản (admin hoặc chính chủ)
- `GET /bookings/{id}` - Xem booking (admin hoặc chính chủ)
- `GET /bookings/user/{user_id}` - Xem booking của user (admin hoặc chính chủ)
- `POST /bookings` - Tạo booking (chỉ cho chính mình)
- `PUT /bookings/{id}/cancel` - Hủy booking (admin hoặc chính chủ)
- `DELETE /bookings/{id}` - Xóa booking (admin hoặc chính chủ)
- `GET /favorites/user/{user_id}` - Xem favorite (admin hoặc chính chủ)
- `POST /favorites/toggle` - Toggle favorite (chỉ cho chính mình)

### Endpoints công khai
- `GET /movies` - Xem danh sách phim
- `GET /movies/{id}` - Xem chi tiết phim
- `GET /theaters` - Xem danh sách rạp
- `GET /theaters/{id}` - Xem chi tiết rạp
- `GET /rooms` - Xem danh sách phòng
- `GET /rooms/{id}` - Xem chi tiết phòng
- `GET /rooms/theater/{theater_id}` - Xem phòng theo rạp
- `GET /seats` - Xem danh sách ghế
- `GET /seats/{id}` - Xem chi tiết ghế
- `GET /seats/room/{room_id}` - Xem ghế theo phòng
- `GET /showtimes` - Xem danh sách suất chiếu
- `GET /showtimes/{id}` - Xem chi tiết suất chiếu
- `GET /showtimes/movie/{movie_id}` - Xem suất chiếu theo phim

## 4. Cài đặt và Chạy

### Cài đặt dependencies
```bash
cd server
pip install -r requirements.txt
```

### Chạy migration
```bash
# Nếu có alembic
alembic upgrade head

# Hoặc tạo database mới
python -c "from app.config.database import engine; from app.models import Base; Base.metadata.create_all(bind=engine)"
```

### Chạy server
```bash
python -m uvicorn app.main:app --reload
```

## 5. Lưu ý

- **SECRET_KEY** trong `jwt_auth.py` cần được thay đổi trong production
- **ACCESS_TOKEN_EXPIRE_MINUTES** có thể điều chỉnh theo nhu cầu
- Clerk và JWT auth có thể hoạt động song song
- User có thể có cả `clerk_id` và `hashed_password` (hybrid auth)
