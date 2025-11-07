# 🔒 SECURITY GUIDE - Settings.py

## ✅ **CÓ THỂ đẩy lên Git**

File `settings.py` đã được cải thiện và **AN TOÀN** để commit lên Git.

## 🛡️ **Cải thiện đã thực hiện:**

### 1. **Thay đổi placeholder values**
```python
# Trước (có thể gây nhầm lẫn)
SECRET_KEY: str = "your-secret-key-change-in-production"

# Sau (rõ ràng hơn)
SECRET_KEY: str = "CHANGE_THIS_IN_PRODUCTION"
```

### 2. **Thêm validation cho production**
```python
def _validate_production_secrets(self):
    """Validate that production secrets are properly set"""
    if self.SECRET_KEY in ["CHANGE_THIS_IN_PRODUCTION", "your-secret-key-change-in-production"]:
        raise ValueError("SECRET_KEY must be changed for production!")
    if self.JWT_SECRET_KEY in ["CHANGE_THIS_IN_PRODUCTION", "your-jwt-secret-key-change-in-production"]:
        raise ValueError("JWT_SECRET_KEY must be changed for production!")
    if self.DEBUG:
        raise ValueError("DEBUG must be False for production!")
```

### 3. **Thêm comments rõ ràng**
```python
# Security Settings - MUST be overridden in .env for production
# JWT Settings - MUST be overridden in .env for production
```

## 🔐 **Cách sử dụng an toàn:**

### **Development (Local)**
```bash
# File .env (không commit)
SECRET_KEY=dev-secret-key-123
JWT_SECRET_KEY=dev-jwt-secret-456
DEBUG=true
ENVIRONMENT=development
```

### **Production (Server)**
```bash
# File .env (không commit)
SECRET_KEY=super-secure-production-key-xyz789
JWT_SECRET_KEY=super-secure-jwt-production-key-abc123
DEBUG=false
ENVIRONMENT=production
```

## ⚠️ **Lưu ý quan trọng:**

### ✅ **AN TOÀN để commit:**
- File `settings.py` với placeholder values
- File `.gitignore` (đã có `.env`)
- Các file config khác

### ❌ **KHÔNG BAO GIỜ commit:**
- File `.env` với secret keys thật
- Database files (`.db`, `.sqlite3`)
- Log files với thông tin nhạy cảm
- API keys thật

## 🚀 **Workflow đúng:**

### 1. **Development**
```bash
# Clone project
git clone <repo>
cd MovieBooking

# Tạo .env từ template
cp server/.example.env server/.env

# Chỉnh sửa .env với dev values
# Chạy ứng dụng
docker-compose up
```

### 2. **Production**
```bash
# Deploy code
git pull origin main

# Tạo .env với production values
# (Không commit file này!)
# Chạy ứng dụng
docker-compose up -d
```

## 🔧 **Tạo secret keys mạnh:**

### **Sử dụng OpenSSL:**
```bash
# Tạo SECRET_KEY
openssl rand -hex 32

# Tạo JWT_SECRET_KEY  
openssl rand -hex 32
```

### **Sử dụng Python:**
```python
import secrets
print(secrets.token_hex(32))
```

## 📋 **Checklist Security:**

- ✅ `settings.py` có placeholder values
- ✅ `.env` được ignore trong `.gitignore`
- ✅ Validation cho production environment
- ✅ Comments rõ ràng về security
- ✅ Không có hardcoded secrets
- ✅ Sử dụng environment variables

## 🎯 **Kết luận:**

**File `settings.py` hiện tại AN TOÀN để đẩy lên Git!**

Bạn có thể commit và push mà không lo lắng về security. Chỉ cần đảm bảo:

1. **File `.env` không được commit** (đã có trong `.gitignore`)
2. **Sử dụng `.env` để override** các giá trị nhạy cảm
3. **Thay đổi secrets** khi deploy production
4. **Không hardcode** bất kỳ secret nào trong code
