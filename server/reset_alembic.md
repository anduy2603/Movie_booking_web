# 🔄 Reset Alembic và Tạo Migration Mới Từ Đầu

## ⚠️ QUAN TRỌNG: Backup Database Trước!

Trước khi reset, hãy backup database của bạn:

```powershell
cd server
copy movie_booking.db movie_booking_backup.db
```

## Các Bước Reset Alembic

### Bước 1: Backup Database (BẮT BUỘC)

```powershell
cd server
copy movie_booking.db movie_booking_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').db
```

### Bước 2: Xóa bảng alembic_version (không xóa data)

```powershell
# Kết nối SQLite
sqlite3 movie_booking.db
```

Trong SQLite prompt:
```sql
-- Xóa bảng alembic_version để reset migration history
DROP TABLE IF EXISTS alembic_version;
.exit
```

### Bước 3: Xóa hoặc di chuyển các migration cũ

```powershell
# Tạo thư mục backup cho migrations cũ
mkdir alembic\versions_backup
move alembic\versions\*.py alembic\versions_backup\
```

### Bước 4: Tạo migration mới từ models hiện tại

```powershell
# Tạo migration mới với tất cả models hiện tại
alembic revision --autogenerate -m "initial_schema_with_rating"
```

### Bước 5: Kiểm tra và chỉnh sửa migration file

Mở file migration mới tạo trong `alembic/versions/` và kiểm tra:
- Đảm bảo có `rating` column trong movies table
- Kiểm tra các bảng khác đúng chưa

### Bước 6: Stamp database (nếu cần) hoặc chạy migration

**Nếu database đã có đầy đủ tables:**
```powershell
# Chỉ đánh dấu đã chạy migration (không thực sự chạy)
alembic stamp head
```

**Nếu database chưa có tables hoặc cần tạo lại:**
```powershell
# Chạy migration thực sự
alembic upgrade head
```

## Cách Khác: Giữ lại migrations cũ nhưng fix

Nếu bạn muốn giữ lại migration history, chỉ cần:

### Option 1: Fix migration hiện tại

1. Giữ nguyên migrations cũ
2. Chỉ cần stamp database với revision hiện tại:
```powershell
alembic stamp add_hashed_password
```
3. Sau đó chạy migration để thêm rating:
```powershell
alembic upgrade head
```

### Option 2: Tạo migration mới mà không xóa cũ

```powershell
# Tạo migration mới chỉ để thêm rating
alembic revision -m "add_rating_to_movies"

# Sau đó sửa file migration mới tạo để chỉ thêm rating column
```

## Kiểm tra sau khi reset

```powershell
# Kiểm tra revision hiện tại
alembic current

# Xem lịch sử migrations
alembic history

# Kiểm tra schema database
sqlite3 movie_booking.db ".schema movies"
```

## Lưu ý

1. **Luôn backup database trước** khi reset
2. Nếu database đã có data, dùng `alembic stamp` thay vì `alembic upgrade`
3. Migration mới sẽ reflect tất cả models hiện tại, bao gồm cả `rating` field
4. Nếu có lỗi, có thể restore từ backup

## Nếu Gặp Lỗi

```powershell
# Restore từ backup
copy movie_booking_backup_*.db movie_booking.db

# Hoặc khôi phục migrations cũ
move alembic\versions_backup\*.py alembic\versions\
```

