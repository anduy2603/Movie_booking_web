"""
Pytest configuration và fixtures cho testing
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.main import app
from app.config.database import get_db
from app.models import Base, User, Movie, Theater, Room, Seat, Showtime, Booking, Payment
from app.auth.jwt_auth import create_access_token


# Test database URL - sử dụng in-memory SQLite
TEST_DATABASE_URL = "sqlite:///:memory:"

# Tạo test engine với in-memory database
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Test session factory
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    """
    Tạo test database session cho mỗi test function.
    Database được tạo mới và xóa sau mỗi test.
    """
    # Tạo tables
    Base.metadata.create_all(bind=test_engine)
    
    # Tạo session
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        # Xóa tất cả tables sau mỗi test
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session: Session):
    """
    Tạo FastAPI test client với test database.
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session: Session) -> User:
    """Tạo test user"""
    from app.auth.jwt_auth import get_password_hash
    
    user = User(
        email="test@example.com",
        username="testuser",
        full_name="Test User",
        hashed_password=get_password_hash("testpassword123"),
        role="customer",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_admin(db_session: Session) -> User:
    """Tạo test admin user"""
    from app.auth.jwt_auth import get_password_hash
    
    admin = User(
        email="admin@example.com",
        username="admin",
        full_name="Admin User",
        hashed_password=get_password_hash("admin123"),
        role="admin",
        is_active=True,
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


@pytest.fixture
def auth_headers(test_user: User):
    """Tạo JWT token headers cho test user"""
    token = create_access_token(data={"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(test_admin: User):
    """Tạo JWT token headers cho test admin"""
    token = create_access_token(data={"sub": str(test_admin.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_movie(db_session: Session) -> Movie:
    """Tạo test movie"""
    movie = Movie(
        title="Test Movie",
        description="A test movie",
        genre="Action",
        duration=120,
        language="English",
        poster_url="https://example.com/poster.jpg",
        trailer_url="https://example.com/trailer.mp4",
    )
    db_session.add(movie)
    db_session.commit()
    db_session.refresh(movie)
    return movie


@pytest.fixture
def test_theater(db_session: Session) -> Theater:
    """Tạo test theater"""
    theater = Theater(
        name="Test Theater",
        city="Test City",
        address="123 Test Street",
    )
    db_session.add(theater)
    db_session.commit()
    db_session.refresh(theater)
    return theater


@pytest.fixture
def test_room(db_session: Session, test_theater: Theater) -> Room:
    """Tạo test room"""
    room = Room(
        name="Room 1",
        room_type="2D",
        total_seats=50,
        theater_id=test_theater.id,
    )
    db_session.add(room)
    db_session.commit()
    db_session.refresh(room)
    return room


@pytest.fixture
def test_showtime(db_session: Session, test_movie: Movie, test_room: Room) -> Showtime:
    """Tạo test showtime"""
    from datetime import datetime, timedelta, timezone
    
    start_time = datetime.now(timezone.utc) + timedelta(hours=1)
    end_time = start_time + timedelta(hours=2)
    
    showtime = Showtime(
        movie_id=test_movie.id,
        room_id=test_room.id,
        start_time=start_time,
        end_time=end_time,
        base_price=100000.0,
        status="active",
    )
    db_session.add(showtime)
    db_session.commit()
    db_session.refresh(showtime)
    return showtime

