# Testing Guide

## Cấu trúc Tests

```
tests/
├── __init__.py
├── conftest.py          # Pytest fixtures và configuration
├── test_user_service.py # Unit tests cho UserService
├── test_auth_api.py     # Integration tests cho Auth API
├── test_movie_api.py    # Integration tests cho Movie API
└── README.md           # File này
```

## Chạy Tests

### Chạy tất cả tests
```bash
cd server
pytest
```

### Chạy với coverage report
```bash
pytest --cov=app --cov-report=html
```

### Chạy test cụ thể
```bash
pytest tests/test_user_service.py
pytest tests/test_auth_api.py::test_login_success
```

### Chạy tests với markers
```bash
pytest -m unit          # Chỉ chạy unit tests
pytest -m integration   # Chỉ chạy integration tests
pytest -m api           # Chỉ chạy API tests
```

### Chạy với verbose output
```bash
pytest -v
```

## Test Coverage

Xem coverage report:
```bash
# Generate HTML report
pytest --cov=app --cov-report=html

# Mở file htmlcov/index.html trong browser
```

## Fixtures

Các fixtures có sẵn trong `conftest.py`:

- `db_session`: Test database session
- `client`: FastAPI test client
- `test_user`: Test user với role customer
- `test_admin`: Test admin user
- `auth_headers`: JWT headers cho test user
- `admin_headers`: JWT headers cho test admin
- `test_movie`: Test movie
- `test_theater`: Test theater
- `test_room`: Test room
- `test_showtime`: Test showtime

## Viết Tests Mới

### Unit Test Example
```python
def test_create_user(db_session: Session):
    service = UserService()
    user_data = UserCreate(...)
    user = service.create(db_session, user_data)
    assert user is not None
```

### Integration Test Example
```python
def test_get_movies(client: TestClient):
    response = client.get("/api/movies")
    assert response.status_code == 200
```

## Best Practices

1. **Isolation**: Mỗi test độc lập, không phụ thuộc vào test khác
2. **Fixtures**: Sử dụng fixtures để setup test data
3. **Naming**: Đặt tên test rõ ràng: `test_<functionality>_<condition>`
4. **Assertions**: Sử dụng assertions cụ thể
5. **Cleanup**: Database được tự động cleanup sau mỗi test

## CI/CD Integration

Tests có thể được chạy trong CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run tests
  run: |
    cd server
    pytest --cov=app --cov-report=xml
```

