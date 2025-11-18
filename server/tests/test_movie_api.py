"""
Integration tests cho Movie API endpoints
"""
import pytest
from fastapi.testclient import TestClient


def test_get_movies(client: TestClient):
    """Test lấy danh sách phim"""
    response = client.get("/movies?page=1&size=10")
    
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "total" in data
    assert "page" in data
    assert isinstance(data["data"], list)


def test_get_movie_by_id(client: TestClient, test_movie):
    """Test lấy chi tiết phim"""
    response = client.get(f"/movies/{test_movie.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_movie.id
    assert data["title"] == test_movie.title


def test_get_movie_not_found(client: TestClient):
    """Test lấy phim không tồn tại"""
    response = client.get("/movies/99999")
    
    assert response.status_code == 404


def test_create_movie_unauthorized(client: TestClient):
    """Test tạo phim không có quyền admin"""
    response = client.post(
        "/movies",
        json={
            "title": "New Movie",
            "description": "A new movie",
            "genre": "Action",
            "duration": 120,
        },
    )
    
    assert response.status_code == 403  # Forbidden


@pytest.mark.api
def test_create_movie_as_admin(client: TestClient, admin_headers, db_session):
    """Test tạo phim với quyền admin"""
    response = client.post(
        "/movies",
        headers=admin_headers,
        json={
            "title": "Admin Movie",
            "description": "A movie created by admin",
            "genre": "Drama",
            "duration": 150,
            "language": "English",
            "poster_url": "https://example.com/poster.jpg",
            "trailer_url": "https://example.com/trailer.mp4",
        },
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Admin Movie"
    assert "id" in data


@pytest.mark.api
def test_update_movie_as_admin(client: TestClient, admin_headers, test_movie):
    """Test cập nhật phim với quyền admin"""
    response = client.put(
        f"/movies/{test_movie.id}",
        headers=admin_headers,
        json={
            "title": "Updated Movie Title",
            "description": test_movie.description,
            "genre": test_movie.genre,
            "duration": test_movie.duration,
        },
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Movie Title"


@pytest.mark.api
def test_delete_movie_as_admin(client: TestClient, admin_headers, test_movie):
    """Test xóa phim với quyền admin"""
    response = client.delete(
        f"/movies/{test_movie.id}",
        headers=admin_headers,
    )
    
    assert response.status_code == 200
    
    # Verify movie đã bị xóa
    get_response = client.get(f"/api/movies/{test_movie.id}")
    assert get_response.status_code == 404

