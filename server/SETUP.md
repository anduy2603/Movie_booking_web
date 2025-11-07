# 🎬 Movie Booking API - Setup Guide

Hướng dẫn cài đặt và chạy Movie Booking API.

## 📋 Yêu cầu hệ thống

- Python 3.10+
- pip (Python package manager)
- Docker & Docker Compose (tùy chọn)

## 🚀 Cài đặt nhanh

### Option 1: Chạy với Docker (Khuyến nghị)

#### 1. Tạo file môi trường
```bash
cd server
cp .example.env .env
```

#### 2. Sinh khóa bảo mật
```bash
# Windows (PowerShell)
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Linux/Mac
openssl rand -hex 32
```

#### 3. Chỉnh sửa file `.env`
Mở file `.env` và cập nhật các giá trị:
- `SECRET_KEY` - Sử dụng chuỗi từ bước trên
- `JWT_SECRET_KEY` - Sử dụng chuỗi khác từ bước trên

#### 4. Chạy với Docker Compose
```bash
# Từ thư mục gốc dự án
docker-compose up --build
```

Server sẽ chạy tại: http://localhost:8000

---

### Option 2: Chạy trực tiếp (Local Development)

#### 1. Tạo virtual environment
```bash
cd server

# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python -m venv venv
source venv/bin/activate
```

#### 2. Cài đặt dependencies
```bash
pip install -r requirements.txt
```

#### 3. Tạo file môi trường
```bash
cp .example.env .env
```

#### 4. Sinh và cập nhật khóa bảo mật
```bash
# Windows (PowerShell)
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Linux/Mac
openssl rand -hex 32
```

Chỉnh sửa file `.env` và cập nhật `SECRET_KEY` và `JWT_SECRET_KEY`.

#### 5. Chạy migrations (nếu có)
```bash
alembic upgrade head
```

#### 6. Tạo dữ liệu mẫu (tùy chọn)
```bash
python seed_data.py
```

#### 7. Chạy server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server sẽ chạy tại: http://localhost:8000

---

## 📚 API Documentation

Sau khi server chạy, truy cập:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🔐 Biến môi trường quan trọng

### Bắt buộc thay đổi cho Production:

```env
SECRET_KEY=your-secret-key-here  # DÙNG LỆNH TẠO KEY AN TOÀN!
JWT_SECRET_KEY=your-jwt-secret-key-here  # DÙNG LỆNH TẠO KEY AN TOÀN!
DEBUG=False  # Phải đặt False
ENVIRONMENT=production  # Đổi từ development
```

### Khuyến nghị:

```env
# Thay đổi database cho production
DATABASE_URL=postgresql://user:pass@localhost:5432/moviebooking_db

# Cấu hình CORS cho domain của bạn
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## 🧪 Test API

```bash
# Chạy test script
python test_api.py

# Hoặc sử dụng curl
curl http://localhost:8000/
```

---

## 📁 Cấu trúc thư mục

```
server/
├── app/
│   ├── controllers/      # API endpoints
│   ├── models/           # Database models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   ├── repositories/     # Data access layer
│   ├── middleware/       # Custom middleware
│   └── config/           # Configuration files
├── alembic/              # Database migrations
├── logs/                 # Log files
├── .env                  # Environment variables (NOT in git)
├── .example.env          # Example env file
└── requirements.txt      # Python dependencies
```

---

## 🐛 Troubleshooting

### Lỗi: `SECRET_KEY must be changed for production`
- Giải pháp: Tạo và cập nhật `SECRET_KEY` và `JWT_SECRET_KEY` trong file `.env`

### Lỗi: `Module not found`
- Giải pháp: Đảm bảo virtual environment đã được kích hoạt và chạy `pip install -r requirements.txt`

### Lỗi: `Port 8000 already in use`
- Giải pháp: Thay đổi port trong `.env` hoặc docker-compose.yml

### Lỗi: Database connection failed
- Giải pháp: Kiểm tra `DATABASE_URL` trong file `.env`

---

## 📞 Support

Nếu gặp vấn đề, vui lòng tạo issue trên repository hoặc liên hệ team phát triển.

---

## 📝 Chú ý

- **KHÔNG BAO GIỜ** commit file `.env` vào git
- Luôn sử dụng key bảo mật mạnh cho production
- Backup database thường xuyên
- Kiểm tra logs tại: `logs/app.log`

