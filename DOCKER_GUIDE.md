# 🐳 Hướng dẫn Docker trong dự án MovieBooking

## 📚 Mục lục
1. [Tổng quan về Docker](#tổng-quan-về-docker)
2. [Dockerfile vs Dockerfile.dev](#dockerfile-vs-dockerfiledev)
3. [COPY vs Volumes - Tại sao không cần COPY trong development?](#copy-vs-volumes)
4. [Docker Compose](#docker-compose)
5. [Development vs Production](#development-vs-production)
6. [Cách hoạt động chi tiết](#cách-hoạt-động-chi-tiết)

---

## 🎯 Tổng quan về Docker

Docker là công cụ để đóng gói ứng dụng và dependencies vào một container, giúp:
- ✅ Môi trường nhất quán giữa các máy
- ✅ Dễ dàng deploy
- ✅ Isolation (cô lập) giữa các ứng dụng
- ✅ Dễ quản lý dependencies

---

## 📄 Dockerfile vs Dockerfile.dev

### 1. **Dockerfile** (Production)

**Mục đích**: Build image để deploy production

**Đặc điểm**:
- ✅ **COPY source code** vào image
- ✅ Build ứng dụng trong image
- ✅ Tạo image tĩnh, không thay đổi
- ✅ Optimized cho production

**Ví dụ Client Dockerfile**:
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
COPY package*.json ./
RUN npm ci
COPY . .                    # ← COPY source code vào image
RUN npm run build           # ← Build trong image

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html  # ← Copy built files
COPY nginx.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]
```

**Kết quả**: Image chứa toàn bộ code đã build, không cần source code gốc.

### 2. **Dockerfile.dev** (Development)

**Mục đích**: Build image để phát triển với hot reload

**Đặc điểm**:
- ❌ **KHÔNG COPY source code** vào image
- ✅ Chỉ cài dependencies
- ✅ Source code được mount từ host qua volumes
- ✅ Code changes reflect ngay lập tức

**Ví dụ Client Dockerfile.dev**:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
# ← KHÔNG COPY . . vì sẽ dùng volumes mount
EXPOSE 5173
CMD ["npm", "run", "dev"]
```

**Kết quả**: Image chỉ chứa dependencies, source code được mount từ host.

---

## 🔄 COPY vs Volumes - Tại sao không cần COPY trong development?

### **COPY** (Trong Dockerfile)

```dockerfile
COPY . .  # Copy source code vào image
```

**Cách hoạt động**:
1. Code được copy vào image khi build
2. Code được "đóng gói" trong image
3. Muốn thay đổi code → phải rebuild image
4. Image lớn hơn (chứa cả source code)

**Khi nào dùng**:
- ✅ Production (code không thay đổi)
- ✅ Khi muốn image độc lập, không cần host

**Ví dụ**:
```bash
# Build image
docker build -t myapp .

# Image chứa code bên trong
# Muốn sửa code → phải rebuild
docker build -t myapp .  # Build lại
```

### **Volumes** (Trong docker-compose)

```yaml
volumes:
  - ./client:/app  # Mount folder từ host vào container
```

**Cách hoạt động**:
1. Code nằm trên host (máy bạn)
2. Docker mount folder từ host vào container
3. Code changes trên host → reflect ngay trong container
4. Image nhỏ hơn (không chứa source code)

**Khi nào dùng**:
- ✅ Development (code thay đổi liên tục)
- ✅ Khi muốn hot reload
- ✅ Khi muốn edit code trên host

**Ví dụ**:
```yaml
# docker-compose.dev.yml
volumes:
  - ./client:/app  # Folder client trên host → /app trong container
```

**Luồng hoạt động**:
```
Host (máy bạn)              Container
┌─────────────┐             ┌─────────────┐
│ ./client/   │  ───mount──>│  /app/      │
│  src/       │             │  src/       │
│  App.jsx    │             │  App.jsx    │
└─────────────┘             └─────────────┘
     ↑                           ↑
Bạn sửa code                  Container thấy
trên host                      thay đổi ngay
```

---

## 🐙 Docker Compose

### **docker-compose.yml** (Production)

**Mục đích**: Chạy services trong production

**Đặc điểm**:
- Dùng `Dockerfile` (production)
- Không có volumes mount (hoặc ít)
- Image đã build sẵn

**Ví dụ**:
```yaml
services:
  client:
    build:
      context: ./client
      # Dùng Dockerfile mặc định
    # Không có volumes → dùng code trong image
```

### **docker-compose.dev.yml** (Development)

**Mục đích**: Chạy services trong development với hot reload

**Đặc điểm**:
- Dùng `Dockerfile.dev`
- Có volumes mount source code
- Hot reload enabled

**Ví dụ**:
```yaml
services:
  client:
    build:
      context: ./client
      dockerfile: Dockerfile.dev  # ← Dùng Dockerfile.dev
    volumes:
      - ./client:/app  # ← Mount source code
      - /app/node_modules  # ← Exclude node_modules
```

---

## 🆚 Development vs Production

### **Development Workflow**

```
1. Build image (chỉ dependencies)
   docker-compose -f docker-compose.dev.yml build

2. Start containers với volumes
   docker-compose -f docker-compose.dev.yml up

3. Code trên host → Mount vào container → Hot reload
   [Bạn sửa code] → [Container thấy ngay] → [App reload]
```

**Files liên quan**:
- `Dockerfile.dev` - Không COPY source code
- `docker-compose.dev.yml` - Có volumes mount
- Source code trên host

### **Production Workflow**

```
1. Build image (có cả source code + build)
   docker-compose build

2. Start containers (không volumes)
   docker-compose up

3. Code đã được build sẵn trong image
   [Image chứa built files] → [Serve với nginx]
```

**Files liên quan**:
- `Dockerfile` - COPY source code và build
- `docker-compose.yml` - Không volumes
- Source code trong image

---

## 🔍 Cách hoạt động chi tiết

### **Scenario 1: Development Mode**

#### **Step 1: Build Image**
```dockerfile
# Dockerfile.dev
FROM node:20-alpine
COPY package*.json ./
RUN npm ci
# ← KHÔNG COPY source code
```

**Kết quả**: Image chỉ chứa:
- Node.js
- Dependencies (node_modules)
- **KHÔNG có** source code (src/, components/, etc.)

#### **Step 2: Start Container với Volumes**
```yaml
# docker-compose.dev.yml
volumes:
  - ./client:/app  # Mount host → container
```

**Kết quả**: 
- Folder `./client` trên host được mount vào `/app` trong container
- Code bạn edit trên host → xuất hiện ngay trong container

#### **Step 3: Run Dev Server**
```dockerfile
CMD ["npm", "run", "dev"]
```

**Kết quả**:
- Vite dev server chạy trong container
- Đọc source code từ `/app` (được mount từ host)
- Hot reload hoạt động vì code thay đổi trên host

### **Scenario 2: Production Mode**

#### **Step 1: Build Image**
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
COPY package*.json ./
RUN npm ci
COPY . .                    # ← COPY source code
RUN npm run build           # ← Build trong image

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

**Kết quả**: Image chứa:
- Built files (dist/)
- Nginx config
- **KHÔNG có** source code gốc

#### **Step 2: Start Container (không volumes)**
```yaml
# docker-compose.yml
# Không có volumes → dùng code trong image
```

**Kết quả**:
- Container dùng built files từ image
- Nginx serve static files
- Không cần source code gốc

---

## 📊 So sánh tổng quan

| Aspect | Development | Production |
|--------|-------------|------------|
| **Dockerfile** | `Dockerfile.dev` | `Dockerfile` |
| **COPY source code?** | ❌ Không | ✅ Có |
| **Volumes mount?** | ✅ Có | ❌ Không |
| **Hot reload?** | ✅ Có | ❌ Không |
| **Image size** | Nhỏ (chỉ deps) | Lớn (có built files) |
| **Code location** | Host → Mount | Image |
| **Rebuild khi sửa code?** | ❌ Không cần | ✅ Cần |
| **Use case** | Phát triển | Deploy |

---

## 🎯 Tóm tắt

### **Tại sao không cần COPY trong Dockerfile.dev?**

1. **Development**: Code thay đổi liên tục
   - Nếu COPY → phải rebuild mỗi lần sửa code → mất thời gian
   - Dùng volumes → code thay đổi ngay → không cần rebuild

2. **Production**: Code không thay đổi
   - COPY vào image → image độc lập, không cần host
   - Không cần volumes → image portable

### **Khi nào dùng gì?**

**Development**:
```bash
docker-compose -f docker-compose.dev.yml up
```
- Dùng `Dockerfile.dev`
- Có volumes mount
- Hot reload

**Production**:
```bash
docker-compose up
```
- Dùng `Dockerfile`
- Không volumes
- Optimized build

---

## 💡 Tips

1. **Development**: Luôn dùng `docker-compose.dev.yml`
2. **Production**: Dùng `docker-compose.yml`
3. **Volumes**: Chỉ cần trong development
4. **COPY**: Chỉ cần trong production
5. **Rebuild**: Production cần rebuild khi code thay đổi, Development không cần

---

## 📚 Tham khảo thêm

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Volumes](https://docs.docker.com/storage/volumes/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

