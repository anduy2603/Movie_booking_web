# 🚀 Hướng Dẫn Chạy Client

## ❌ Lỗi: `ERR_CONNECTION_REFUSED` trên `localhost:5173`

### 🔍 Nguyên nhân:
- Không có service nào đang chạy trên port 5173
- Có thể đang dùng `docker-compose.yml` (production) thay vì `docker-compose.dev.yml` (development)
- Hoặc chưa start dev server local

---

## ✅ Giải pháp:

### **Option 1: Chạy Development với Docker (Khuyến nghị)**

Sử dụng `docker-compose.dev.yml` để chạy Vite dev server trên port 5173:

```bash
# Dừng containers hiện tại (nếu có)
docker-compose down

# Chạy với docker-compose.dev.yml
docker-compose -f docker-compose.dev.yml up --build -d

# Xem logs để đảm bảo client đã start
docker-compose -f docker-compose.dev.yml logs -f client
```

Sau đó truy cập: **http://localhost:5173**

---

### **Option 2: Chạy Local Development Server**

Chạy Vite dev server trực tiếp trên máy (không dùng Docker):

```bash
cd client

# Cài đặt dependencies (nếu chưa có)
npm install --legacy-peer-deps

# Chạy dev server
npm run dev
```

Sau đó truy cập: **http://localhost:5173**

---

### **Option 3: Sử dụng Production Build (Port 3000)**

Nếu đang dùng `docker-compose.yml` (production), client sẽ chạy trên port 3000 (nginx):

```bash
docker-compose up --build -d
```

Truy cập: **http://localhost:3000** (không phải 5173)

---

## 🔍 Kiểm tra:

### 1. Kiểm tra containers đang chạy:
```bash
docker ps
```

Bạn sẽ thấy:
- `moviebooking-client` - Client container
- `moviebooking-server` - Server container

### 2. Kiểm tra logs client:
```bash
# Nếu dùng docker-compose.yml
docker-compose logs client

# Nếu dùng docker-compose.dev.yml
docker-compose -f docker-compose.dev.yml logs client
```

### 3. Kiểm tra port đang được sử dụng:
```bash
# Windows
netstat -ano | findstr :5173
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :5173
lsof -i :3000
```

---

## 📝 So sánh:

| Mode | File | Port | Server | Hot Reload |
|------|------|------|--------|------------|
| **Development (Docker)** | `docker-compose.dev.yml` | 5173 | Vite Dev Server | ✅ Yes |
| **Development (Local)** | - | 5173 | Vite Dev Server | ✅ Yes |
| **Production (Docker)** | `docker-compose.yml` | 3000 | Nginx | ❌ No |

---

## 🎯 Khuyến nghị:

**Cho Development:**
- ✅ Dùng `docker-compose.dev.yml` với hot reload
- ✅ Hoặc chạy local: `npm run dev` trong thư mục `client/`

**Cho Production:**
- ✅ Dùng `docker-compose.yml` với Nginx

---

## ⚠️ Lưu ý:

1. **Port 5173**: Chỉ có khi chạy Vite dev server (development)
2. **Port 3000**: Khi chạy production build với Nginx
3. **Backend API**: Luôn chạy trên port 8000

---

## 🐛 Troubleshooting:

### Lỗi: Port 5173 đã được sử dụng
```bash
# Tìm process đang dùng port 5173
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5173
kill -9 <PID>
```

### Lỗi: Container không start
```bash
# Xem logs chi tiết
docker-compose -f docker-compose.dev.yml logs client

# Rebuild container
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml build --no-cache client
docker-compose -f docker-compose.dev.yml up -d
```

### Lỗi: npm dependencies
```bash
cd client
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

