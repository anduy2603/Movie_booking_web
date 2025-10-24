# Hướng dẫn Authentication System

## Tổng quan

Dự án đã được chuyển từ Clerk authentication sang hệ thống JWT authentication truyền thống.

## Backend Authentication

### Endpoints có sẵn

- `POST /auth/register` - Đăng ký user mới
- `POST /auth/login` - Đăng nhập
- `POST /auth/change-password` - Đổi mật khẩu
- `GET /auth/me` - Lấy thông tin user hiện tại
- `PUT /auth/me` - Cập nhật thông tin profile
- `POST /auth/logout` - Đăng xuất

### Cách sử dụng

#### Đăng ký
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe",
    "username": "johndoe"
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

## Frontend Authentication

### Components mới

1. **AuthContext** (`src/contexts/AuthContext.jsx`)
   - Quản lý authentication state
   - Cung cấp các functions: login, register, logout, updateProfile, changePassword

2. **Login Component** (`src/components/Login.jsx`)
   - Form đăng nhập với email/password
   - Validation và error handling

3. **Register Component** (`src/components/Register.jsx`)
   - Form đăng ký với đầy đủ thông tin
   - Validation mật khẩu và xác nhận

4. **ProtectedRoute** (`src/components/ProtectedRoute.jsx`)
   - Bảo vệ các routes cần authentication
   - Redirect về trang chủ nếu chưa đăng nhập

### Hooks

1. **useAuth** (`src/hooks/useAuth.js`)
   - `useAuth()` - Lấy toàn bộ auth context
   - `useAuthActions()` - Lấy các action functions
   - `useUser()` - Lấy thông tin user và authentication state

### Cách sử dụng trong components

```jsx
import { useUser, useAuthActions } from '../hooks/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated, loading } = useUser();
  const { login, logout, updateProfile } = useAuthActions();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user.full_name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => login('email', 'password')}>Login</button>
      )}
    </div>
  );
};
```

## Cấu hình

### Environment Variables

Tạo file `.env` trong thư mục `client/`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Protected Routes

Các routes sau yêu cầu authentication:
- `/my-bookings` - Xem lịch sử đặt vé
- `/favorite` - Xem danh sách yêu thích
- `/movies/:id/:date` - Đặt ghế (cần đăng nhập để đặt vé)

## Migration từ Clerk

### Đã loại bỏ:
- Clerk Provider từ main.jsx
- Clerk hooks và components
- Clerk authentication logic từ backend

### Đã thêm:
- JWT-based authentication
- Custom auth context và hooks
- Login/Register modals
- Protected routes system

## Security Features

1. **JWT Tokens**: Secure token-based authentication
2. **Password Hashing**: Bcrypt password hashing
3. **Token Expiration**: Configurable token expiry
4. **Protected Routes**: Automatic route protection
5. **User Roles**: Admin/Customer role system

## Testing

### Backend Testing
```bash
# Start backend server
cd server
python -m uvicorn app.main:app --reload

# Test endpoints
curl -X POST "http://localhost:8000/auth/register" -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'
```

### Frontend Testing
```bash
# Start frontend
cd client
npm run dev

# Navigate to http://localhost:5173
# Test login/register functionality
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Đảm bảo backend CORS được cấu hình đúng
2. **Token Expired**: Token sẽ tự động refresh hoặc yêu cầu đăng nhập lại
3. **Network Errors**: Kiểm tra VITE_API_BASE_URL trong .env

### Debug Mode

Để debug authentication:
1. Mở Developer Tools
2. Check Network tab cho API calls
3. Check Application tab cho localStorage token
4. Check Console cho error messages
