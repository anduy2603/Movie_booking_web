# 🎬 Movie Booking System

Hệ thống đặt vé phim trực tuyến hiện đại với React + FastAPI.

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

## 📖 Mô tả

Movie Booking System là một ứng dụng web toàn diện cho phép người dùng xem lịch chiếu phim, đặt ghế và quản lý vé của mình. Hệ thống được xây dựng với kiến trúc hiện đại, bảo mật cao và trải nghiệm người dùng tuyệt vời.

### ✨ Tính năng

**Frontend:**
- 🎥 Xem danh sách phim đang chiếu
- 🔍 Tìm kiếm và lọc phim
- 📅 Chọn ngày và suất chiếu
- 🪑 Chọn ghế tương tác
- 💳 Thanh toán và xác nhận vé
- ⭐ Thêm phim vào yêu thích
- 📝 Xem lịch sử đặt vé
- 🔐 Đăng nhập/Đăng ký an toàn

**Backend:**
- 🏗️ Kiến trúc Clean Architecture
- 🔒 JWT Authentication & Authorization
- 🛡️ Bảo mật: Rate limiting, CORS, IP filtering
- 📊 SQLite database (có thể nâng cấp PostgreSQL)
- 📝 API documentation với Swagger UI
- 🔄 Database migrations với Alembic
- 🧪 Data validation với Pydantic
- 📈 Structured logging

## 🏗️ Kiến trúc dự án

```
MovieBooking/
├── client/              # React Frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Route pages
│   │   ├── contexts/    # React contexts
│   │   └── hooks/       # Custom hooks
│   └── public/          # Static assets
│
├── server/              # FastAPI Backend
│   ├── app/
│   │   ├── controllers/ # API endpoints
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # Business logic
│   │   ├── repositories/# Data access layer
│   │   ├── middleware/  # Custom middleware
│   │   └── auth/        # Authentication
│   ├── alembic/         # Database migrations
│   └── logs/            # Application logs
│
└── docker-compose.yml   # Docker configuration
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **React Router 7** - Routing
- **Vite** - Build tool
- **Tailwind CSS 4** - Styling
- **React Hot Toast** - Notifications
- **Plyr** - Video player
- **Lucide React** - Icons

### Backend
- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **SQLAlchemy 2.0** - ORM
- **Pydantic** - Data validation
- **Python-Jose** - JWT handling
- **Passlib** - Password hashing
- **Alembic** - Database migrations
- **Python-multipart** - File uploads

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (khuyến nghị)

### Cài đặt với Docker (Khuyến nghị)

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

#### 3. Sinh khóa bảo mật

**Windows (PowerShell):**
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Linux/Mac:**
```bash
openssl rand -hex 32
```

Chỉnh sửa file `server/.env` và cập nhật:
- `SECRET_KEY` 
- `JWT_SECRET_KEY`

#### 4. Chạy toàn bộ hệ thống
```bash
# Từ thư mục gốc
docker-compose up --build
```

Hệ thống sẽ chạy tại:
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Frontend**: http://localhost:5173

### Cài đặt local (Development)

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

## 📚 API Documentation

Sau khi server chạy:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Các endpoint chính

#### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Làm mới token
- `GET /api/auth/me` - Lấy thông tin user

#### Movies
- `GET /api/movies` - Danh sách phim
- `GET /api/movies/{id}` - Chi tiết phim
- `GET /api/movies/search` - Tìm kiếm phim

#### Bookings
- `GET /api/bookings` - Lịch sử đặt vé
- `POST /api/bookings` - Đặt vé mới
- `GET /api/bookings/{id}` - Chi tiết vé

#### Showtimes
- `GET /api/showtimes` - Lịch chiếu
- `GET /api/showtimes/{id}/seats` - Trạng thái ghế

## 🔐 Bảo mật

Hệ thống có các tính năng bảo mật:

- 🔑 JWT Authentication
- 🔒 Password hashing với bcrypt
- 🛡️ Rate limiting
- 🌐 CORS protection
- 📝 Input validation
- 🔍 SQL injection prevention
- 🚫 CSRF protection

> ⚠️ **QUAN TRỌNG**: Luôn thay đổi `SECRET_KEY` và `JWT_SECRET_KEY` trong file `.env` trước khi deploy production!

## 📁 Cấu trúc thư mục chi tiết

### Backend (`server/app/`)

- **models/**: SQLAlchemy database models
- **schemas/**: Pydantic validation schemas
- **controllers/**: FastAPI route handlers
- **services/**: Business logic layer
- **repositories/**: Data access layer
- **middleware/**: Custom middleware (CORS, logging, rate limiting)
- **auth/**: JWT authentication & permissions
- **config/**: Settings & configuration

### Frontend (`client/src/`)

- **components/**: Reusable React components
- **pages/**: Page components (routes)
- **contexts/**: React Context providers
- **hooks/**: Custom React hooks
- **styles/**: CSS files
- **utils/**: Utility functions

## 🧪 Testing

### Backend API Testing
```bash
cd server
python test_api.py
```

### Frontend Testing
```bash
cd client
npm run test
```

## 📦 Production Deployment

### 1. Cập nhật file `.env`
```env
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=<strong-random-key>
JWT_SECRET_KEY=<strong-random-key>

# Sử dụng PostgreSQL
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# CORS origins
CORS_ORIGINS=https://yourdomain.com
```

### 2. Build và deploy

**Build frontend:**
```bash
cd client
npm run build
```

**Run migration:**
```bash
cd server
alembic upgrade head
```

**Deploy với Docker:**
```bash
docker-compose up -d
```

## 📖 Tài liệu bổ sung

- [Authentication Guide](./AUTHENTICATION_GUIDE.md) - Hướng dẫn xác thực
- [Security Settings](./SECURITY_SETTINGS_GUIDE.md) - Cài đặt bảo mật
- [Server Setup Guide](./server/SETUP.md) - Hướng dẫn setup server
- [Auth Form Guide](./AUTH_FORM_GUIDE.md) - Form xác thực
- [Server Auth Test](./SERVER_AUTH_TEST_GUIDE.md) - Testing authentication

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👥 Authors

- Movie Booking Team

## 🙏 Acknowledgments

- FastAPI community
- React team
- All open source contributors

---

**Note**: Đảm bảo không commit file `.env` vào git. File này chứa thông tin nhạy cảm!

