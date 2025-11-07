# 🎬 Movie Booking System

Hệ thống đặt vé phim trực tuyến hiện đại với React + FastAPI.

> ⚠️ **Lưu ý**: Đây là dự án cá nhân, hiện tại chỉ sử dụng trong môi trường **development**. Production deployment sẽ được thực hiện trong tương lai.

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

## 📖 Mô tả

Movie Booking System là một dự án cá nhân - ứng dụng web toàn diện cho phép người dùng xem lịch chiếu phim, đặt ghế và quản lý vé của mình. Hệ thống được xây dựng với kiến trúc hiện đại, bảo mật cao và trải nghiệm người dùng tuyệt vời.

**Mục đích**: Dự án học tập và portfolio cá nhân, tập trung vào việc học và thực hành các công nghệ web hiện đại.

### ✨ Tính năng

**Frontend (Người dùng):**
- 🎥 Xem danh sách phim đang chiếu với pagination
- 🔍 Tìm kiếm và lọc phim theo thể loại, ngày phát hành
- 📅 Chọn ngày và suất chiếu
- 🪑 Chọn ghế tương tác với giao diện trực quan
- 💳 Thanh toán và xác nhận vé
- ⭐ Thêm/xóa phim vào yêu thích
- 📝 Xem lịch sử đặt vé
- 👤 Quản lý profile cá nhân
- 🔐 Đăng nhập/Đăng ký an toàn với JWT

**Frontend (Admin):**
- 🎛️ Dashboard quản trị đầy đủ
- 🎬 Quản lý phim (CRUD) với pagination
- 🏢 Quản lý rạp chiếu phim
- 🎭 Quản lý phòng chiếu
- 🪑 Quản lý ghế ngồi
- 🕐 Quản lý suất chiếu
- 👥 Quản lý người dùng
- 💰 Quản lý thanh toán
- 📊 Xem thống kê và báo cáo

**Backend:**
- 🏗️ Kiến trúc Clean Architecture (Controller → Service → Repository)
- 🔒 JWT Authentication & Authorization với role-based access
- 🛡️ Bảo mật: Rate limiting, CORS, Input validation
- 📊 SQLite database (phù hợp cho development, có thể nâng cấp PostgreSQL khi deploy production)
- 📝 API documentation với Swagger UI / ReDoc
- 🔄 Database migrations với Alembic
- 🧪 Data validation với Pydantic
- 📈 Structured logging
- 🔍 Pagination cho tất cả danh sách

## 🏗️ Kiến trúc dự án

```
MovieBooking/
├── client/              # React Frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── Admin*.jsx  # Admin dashboard components
│   │   │   ├── Auth*.jsx   # Authentication components
│   │   │   └── *.jsx       # Other reusable components
│   │   ├── pages/       # Route pages
│   │   │   ├── Home.jsx
│   │   │   ├── Movies.jsx
│   │   │   ├── MovieDetails.jsx
│   │   │   ├── SeatLayout.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   └── Favorite.jsx
│   │   ├── contexts/    # React contexts (AuthContext)
│   │   ├── hooks/       # Custom hooks (useAuth, useDropdown)
│   │   ├── services/    # API service functions
│   │   ├── lib/         # Utilities (api.js, timeFormat.js)
│   │   └── styles/      # CSS files
│   └── public/          # Static assets
│
├── server/              # FastAPI Backend
│   ├── app/
│   │   ├── controllers/ # API endpoints (route handlers)
│   │   ├── models/      # SQLAlchemy database models
│   │   ├── schemas/     # Pydantic validation schemas
│   │   ├── services/    # Business logic layer
│   │   ├── repositories/# Data access layer
│   │   ├── middleware/  # Custom middleware
│   │   │   ├── cors.py
│   │   │   ├── logging.py
│   │   │   ├── rate_limit.py
│   │   │   └── security.py
│   │   ├── auth/        # Authentication & permissions
│   │   │   ├── jwt_auth.py
│   │   │   └── permissions.py
│   │   └── config/      # Settings & configuration
│   ├── alembic/         # Database migrations
│   ├── logs/            # Application logs
│   └── data/            # Data files
│
└── docker-compose.yml   # Docker configuration
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **React Router 7** - Routing
- **Vite 7** - Build tool
- **Tailwind CSS 4** - Styling
- **React Hot Toast** - Notifications
- **Axios** - HTTP client
- **Plyr/React Player** - Video player
- **Lucide React** - Icons

### Backend
- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **SQLAlchemy 2.0** - ORM
- **Pydantic** - Data validation
- **Python-Jose** - JWT handling
- **Passlib + bcrypt** - Password hashing
- **Alembic** - Database migrations
- **Python-multipart** - File uploads

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy (production)

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (khuyến nghị)

### Cài đặt với Docker (Khuyến nghị cho Development)

#### 1. Clone repository
```bash
git clone <repository-url>
cd MovieBooking
```

#### 2. Thiết lập môi trường Backend
```bash
cd server

# Copy file môi trường
cp .example.env .env

# Hoặc chạy script tự động (PowerShell)
./create-env.ps1

# Hoặc (Linux/Mac)
chmod +x create-env.sh
./create-env.sh
```

#### 3. Sinh khóa bảo mật (cho development)

**Windows (PowerShell):**
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Linux/Mac:**
```bash
openssl rand -hex 32
```

Chỉnh sửa file `server/.env` và cập nhật:
- `SECRET_KEY` - Sử dụng chuỗi ngẫu nhiên từ bước trên (hoặc dùng giá trị mặc định cho dev)
- `JWT_SECRET_KEY` - Sử dụng chuỗi ngẫu nhiên khác (hoặc dùng giá trị mặc định cho dev)
- `DATABASE_URL` - Mặc định: `sqlite:///./movie_booking.db` (phù hợp cho development)
- `ENVIRONMENT=development` - Đảm bảo đặt môi trường là development
- `DEBUG=true` - Bật debug mode cho development

#### 4. Chạy toàn bộ hệ thống
```bash
# Từ thư mục gốc
docker-compose up --build
```

Hệ thống sẽ chạy tại:
- **Backend API**: http://localhost:8000
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **API Documentation (ReDoc)**: http://localhost:8000/redoc
- **Frontend**: http://localhost:3000 (với Docker) hoặc http://localhost:5173 (với npm run dev)

### Cài đặt local (Development - Khuyến nghị)

#### Backend Setup

```bash
cd server

# Tạo virtual environment
python -m venv venv

# Kích hoạt virtual environment
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo file .env
cp .example.env .env
# Chỉnh sửa .env và cập nhật SECRET_KEY, JWT_SECRET_KEY

# Chạy migrations
alembic upgrade head

# Tạo dữ liệu mẫu (tùy chọn)
python seed_data.py

# Chạy server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup

```bash
cd client

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: http://localhost:5173

## 📚 API Documentation

Sau khi server chạy, truy cập:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Các endpoint chính

#### 🔐 Authentication (`/api/auth/`)
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Làm mới token
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `PUT /api/auth/profile` - Cập nhật profile
- `POST /api/auth/change-password` - Đổi mật khẩu

#### 🎬 Movies (`/api/movies/`)
- `GET /api/movies` - Danh sách phim (có pagination và search)
- `GET /api/movies/{id}` - Chi tiết phim
- `POST /api/movies` - Tạo phim mới (admin only)
- `PUT /api/movies/{id}` - Cập nhật phim (admin only)
- `DELETE /api/movies/{id}` - Xóa phim (admin only)

#### 🏢 Theaters (`/api/theaters/`)
- `GET /api/theaters` - Danh sách rạp (có pagination)
- `GET /api/theaters/{id}` - Chi tiết rạp
- `POST /api/theaters` - Tạo rạp mới (admin only)
- `PUT /api/theaters/{id}` - Cập nhật rạp (admin only)
- `DELETE /api/theaters/{id}` - Xóa rạp (admin only)

#### 🎭 Rooms (`/api/rooms/`)
- `GET /api/rooms` - Danh sách phòng (có pagination)
- `GET /api/rooms/{id}` - Chi tiết phòng
- `GET /api/rooms/theater/{theater_id}` - Phòng theo rạp
- `POST /api/rooms` - Tạo phòng mới (admin only)
- `POST /api/rooms/{id}/generate-seats` - Tạo ghế tự động (admin only)
- `PUT /api/rooms/{id}` - Cập nhật phòng (admin only)
- `DELETE /api/rooms/{id}` - Xóa phòng (admin only)

#### 🪑 Seats (`/api/seats/`)
- `GET /api/seats` - Danh sách ghế
- `GET /api/seats/{id}` - Chi tiết ghế
- `GET /api/seats/room/{room_id}` - Ghế theo phòng
- `POST /api/seats` - Tạo ghế (admin only)
- `PUT /api/seats/{id}` - Cập nhật ghế (admin only)
- `DELETE /api/seats/{id}` - Xóa ghế (admin only)

#### 🕐 Showtimes (`/api/showtimes/`)
- `GET /api/showtimes` - Danh sách suất chiếu (có pagination)
- `GET /api/showtimes/{id}` - Chi tiết suất chiếu
- `GET /api/showtimes/movie/{movie_id}` - Suất chiếu theo phim
- `POST /api/showtimes` - Tạo suất chiếu mới (admin only)
- `PUT /api/showtimes/{id}` - Cập nhật suất chiếu (admin only)
- `DELETE /api/showtimes/{id}` - Xóa suất chiếu (admin only)

#### 🎫 Bookings (`/api/bookings/`)
- `GET /api/bookings` - Tất cả booking (admin only, có pagination)
- `GET /api/bookings/{id}` - Chi tiết booking
- `GET /api/bookings/user/{user_id}` - Booking của user (có pagination)
- `GET /api/bookings/showtime/{showtime_id}` - Booking theo suất chiếu
- `POST /api/bookings` - Tạo booking (có thể nhiều ghế)
- `PUT /api/bookings/{id}/cancel` - Hủy booking
- `DELETE /api/bookings/{id}` - Xóa booking

#### 💰 Payments (`/api/payments/`)
- `POST /api/payments` - Tạo thanh toán
- `GET /api/payments/me` - Thanh toán của tôi
- `GET /api/payments/{id}` - Chi tiết thanh toán
- `PUT /api/payments/{id}/status` - Cập nhật trạng thái thanh toán

#### ❤️ Favorites (`/api/favorites/`)
- `GET /api/favorites/user/{user_id}` - Danh sách phim yêu thích
- `POST /api/favorites/toggle` - Thêm/xóa yêu thích
- `POST /api/favorites/add` - Thêm vào yêu thích
- `POST /api/favorites/remove` - Xóa khỏi yêu thích

#### 👥 Users (`/api/users/`)
- `GET /api/users/me` - Thông tin user hiện tại
- `GET /api/users` - Danh sách users (admin only, có pagination)
- `GET /api/users/{id}` - Chi tiết user
- `PUT /api/users/{id}` - Cập nhật user (admin hoặc chính chủ)
- `DELETE /api/users/{id}` - Xóa user (admin only)

## 🔐 Bảo mật

Hệ thống có các tính năng bảo mật:

- 🔑 **JWT Authentication** - Token-based authentication
- 🔒 **Password Hashing** - Bcrypt với salt rounds
- 🛡️ **Rate Limiting** - Giới hạn số lượng request
- 🌐 **CORS Protection** - Chỉ cho phép origins được cấu hình
- 📝 **Input Validation** - Pydantic validation cho tất cả inputs
- 🔍 **SQL Injection Prevention** - SQLAlchemy ORM parameterized queries
- 🚫 **Role-based Access Control** - Phân quyền admin/customer
- 📊 **Structured Logging** - Log tất cả activities

> ⚠️ **QUAN TRỌNG**: Luôn thay đổi `SECRET_KEY` và `JWT_SECRET_KEY` trong file `.env` trước khi deploy production!

## 👤 Tài khoản mặc định

Sau khi chạy `seed_data.py`, bạn có thể đăng nhập với:

**Admin:**
- Email: `admin@moviebooking.com`
- Password: `admin123`

**Customer:**
- Email: `john@example.com`
- Password: `password123`

## 📁 Cấu trúc thư mục chi tiết

### Backend (`server/app/`)

- **models/**: SQLAlchemy database models
  - `user.py` - User model
  - `movie.py` - Movie model
  - `theater.py` - Theater model
  - `room.py` - Room model
  - `seat.py` - Seat model
  - `showtime.py` - Showtime model
  - `booking.py` - Booking model
  - `payment.py` - Payment model
  - `favorites.py` - Favorites association table

- **schemas/**: Pydantic validation schemas
  - `user_schema.py` - User schemas
  - `movie_schema.py` - Movie schemas
  - `booking_schema.py` - Booking schemas
  - ... và các schemas khác

- **controllers/**: FastAPI route handlers
  - `auth_controller.py` - Authentication endpoints
  - `movie_controller.py` - Movie endpoints
  - `booking_controller.py` - Booking endpoints
  - ... và các controllers khác

- **services/**: Business logic layer
  - Chứa tất cả business logic
  - Không phụ thuộc vào database implementation

- **repositories/**: Data access layer
  - Tương tác trực tiếp với database
  - Abstract hóa database operations

- **middleware/**: Custom middleware
  - `cors.py` - CORS configuration
  - `logging.py` - Request/response logging
  - `rate_limit.py` - Rate limiting
  - `security.py` - Security headers

- **auth/**: Authentication & permissions
  - `jwt_auth.py` - JWT token handling
  - `permissions.py` - Role-based permissions

- **config/**: Settings & configuration
  - `settings.py` - Application settings
  - `database.py` - Database configuration
  - `logger.py` - Logging configuration

### Frontend (`client/src/`)

- **components/**: Reusable React components
  - `Admin*.jsx` - Admin dashboard components
  - `Auth*.jsx` - Authentication components
  - `MovieCard.jsx` - Movie card component
  - `Navbar.jsx` - Navigation bar
  - `Footer.jsx` - Footer component
  - ... và các components khác

- **pages/**: Page components (routes)
  - `Home.jsx` - Trang chủ
  - `Movies.jsx` - Danh sách phim
  - `MovieDetails.jsx` - Chi tiết phim
  - `SeatLayout.jsx` - Chọn ghế
  - `MyBookings.jsx` - Lịch sử đặt vé
  - `Favorite.jsx` - Phim yêu thích

- **contexts/**: React Context providers
  - `AuthContext.jsx` - Authentication context

- **hooks/**: Custom React hooks
  - `useAuth.js` - Authentication hook
  - `useDropdown.js` - Dropdown hook

- **services/**: API service functions
  - `authService.js` - Authentication API
  - `movieService.js` - Movie API
  - `bookingService.js` - Booking API
  - ... và các services khác

- **lib/**: Utility functions
  - `api.js` - Axios instance và interceptors
  - `timeFormat.js` - Time formatting utilities

## 🧪 Testing

### Backend API Testing
```bash
cd server
python test_api.py
```

### Test với Swagger UI
Truy cập http://localhost:8000/docs để test API trực tiếp trong browser.

## 🚀 Production Deployment (Tương lai)

> 💡 **Ghi chú**: Hiện tại dự án chỉ được sử dụng trong môi trường development. Production deployment sẽ được thực hiện trong tương lai.

Khi sẵn sàng deploy production, các bước cần thực hiện:

### Checklist cho Production:
- [ ] Cập nhật `ENVIRONMENT=production` và `DEBUG=False` trong `.env`
- [ ] Thay đổi `SECRET_KEY` và `JWT_SECRET_KEY` thành keys mạnh
- [ ] Chuyển từ SQLite sang PostgreSQL
- [ ] Cấu hình CORS origins cho domain production
- [ ] Setup HTTPS/SSL certificate
- [ ] Cấu hình rate limiting chặt chẽ hơn
- [ ] Setup monitoring và logging
- [ ] Backup database tự động
- [ ] Setup CI/CD pipeline

### Build cho Production:
```bash
# Build frontend
cd client
npm run build

# Run migrations
cd server
alembic upgrade head
```

## 🔄 Database Migrations

### Tạo migration mới
```bash
cd server
alembic revision --autogenerate -m "description"
```

### Chạy migrations
```bash
alembic upgrade head
```

### Rollback migration
```bash
alembic downgrade -1
```

### Xem lịch sử migrations
```bash
alembic history
```

## 📖 Tài liệu bổ sung

- [Authentication Guide](./AUTHENTICATION_GUIDE.md) - Hướng dẫn xác thực chi tiết
- [Security Settings](./SECURITY_SETTINGS_GUIDE.md) - Cài đặt bảo mật
- [Server Setup Guide](./server/SETUP.md) - Hướng dẫn setup server
- [Server Auth Test](./SERVER_AUTH_TEST_GUIDE.md) - Testing authentication

## 🐛 Troubleshooting

### Lỗi kết nối database
- Kiểm tra `DATABASE_URL` trong file `.env`
- Đảm bảo database file tồn tại (SQLite) hoặc server đang chạy (PostgreSQL)

### Lỗi authentication
- Kiểm tra `JWT_SECRET_KEY` trong file `.env`
- Kiểm tra token có hợp lệ không
- Xem logs trong `server/logs/app.log`

### Lỗi CORS
- Kiểm tra `CORS_ORIGINS` trong file `.env`
- Đảm bảo frontend URL được thêm vào danh sách allowed origins

### Lỗi migration
- Kiểm tra version của Alembic: `alembic current`
- Xem lịch sử: `alembic history`
- Reset nếu cần: Xem `server/reset_alembic.ps1`

## 📋 Roadmap (Kế hoạch tương lai)

### Tính năng sắp tới:
- [ ] Thêm unit tests và integration tests
- [ ] Cải thiện UI/UX với animations
- [ ] Thêm tính năng đánh giá và review phim
- [ ] Thêm tính năng thông báo email
- [ ] Tối ưu performance và caching
- [ ] Thêm support cho mobile app
- [ ] Production deployment

### Cải thiện kỹ thuật:
- [ ] Thêm Redis cho caching
- [ ] Setup CI/CD pipeline
- [ ] Thêm monitoring và analytics
- [ ] Cải thiện error handling
- [ ] Thêm API rate limiting nâng cao

## 📝 License

This project is licensed under the ISC License.

## 👤 Author

Dự án cá nhân được phát triển để học tập và xây dựng portfolio.

## 🙏 Acknowledgments

- FastAPI community
- React team
- All open source contributors

---

## 📊 Tình trạng dự án

Dự án đã hoàn thiện ~95% với đầy đủ các tính năng cốt lõi:

- ✅ Backend API: 100% hoàn thành
- ✅ Frontend Core Features: 95% hoàn thành
- ✅ Admin Dashboard: 90% hoàn thành
- ✅ Authentication: 100% hoàn thành
- ✅ Database: 100% hoàn thành

**Dự án hiện tại sẵn sàng để:**
- ✅ Sử dụng trong môi trường development
- ✅ Demo và presentation
- ✅ Học tập và thực hành
- ✅ Portfolio cá nhân

**Chưa sẵn sàng cho:**
- ⏳ Production deployment (sẽ thực hiện trong tương lai)

---

## ⚠️ Lưu ý quan trọng

- 🔒 **Bảo mật**: Đảm bảo không commit file `.env` vào git. File này chứa thông tin nhạy cảm!
- 🐛 **Bugs**: Dự án đang trong giai đoạn development, có thể còn một số bugs chưa được phát hiện.
- 📝 **Documentation**: Tài liệu sẽ được cập nhật thường xuyên khi có thay đổi.
- 🚀 **Production**: Chưa được tối ưu và test kỹ lưỡng cho production environment.

---

**Cảm ơn bạn đã quan tâm đến dự án!** 🙏
