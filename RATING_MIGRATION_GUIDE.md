# 🔧 Hướng dẫn chạy Migration để thêm Rating

## Vấn đề
Lỗi 500 khi tạo phim mới do database chưa có column `rating`.

## Giải pháp: Chạy Migration

### Bước 1: Kiểm tra trạng thái migration hiện tại
```bash
cd server
alembic current
```

### Bước 2: Xem danh sách migrations
```bash
alembic history
```

### Bước 3: Chạy migration để thêm column rating
```bash
alembic upgrade head
```

### Bước 4: Kiểm tra lại
```bash
alembic current
```

## Nếu gặp lỗi

### Lỗi: "Target database is not up to date"
```bash
# Xem migration nào chưa chạy
alembic heads

# Chạy tất cả migrations chưa chạy
alembic upgrade head
```

### Lỗi: "Can't locate revision identified by 'add_rating_to_movies'"
```bash
# Kiểm tra file migration có tồn tại không
ls alembic/versions/add_rating_to_movies.py

# Nếu không có, cần tạo lại migration
alembic revision -m "add_rating_to_movies"
```

### Lỗi: "Table 'movies' already has column 'rating'"
- Database đã có column rồi, không cần chạy migration
- Hoặc có thể column tồn tại nhưng migration chưa được đánh dấu là đã chạy
- Chạy: `alembic stamp head` để đánh dấu tất cả migrations đã chạy

## Kiểm tra thủ công (SQLite)

Nếu dùng SQLite, có thể kiểm tra trực tiếp:
```bash
cd server
sqlite3 movie_booking.db
.tables
.schema movies
```

Nếu không có column `rating`, cần chạy migration.

## Sau khi chạy migration thành công

1. Restart server backend
2. Thử tạo phim mới lại
3. Kiểm tra xem rating có hiển thị đúng không

