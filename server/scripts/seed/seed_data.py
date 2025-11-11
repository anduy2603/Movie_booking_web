#!/usr/bin/env python3
"""
Script để tạo dữ liệu mẫu cho Movie Booking API
Chạy: python scripts/seed/seed_data.py (từ thư mục server/)
"""

import sys
import os
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session

# Thêm path để import app (từ scripts/seed/ lên server/)
script_dir = os.path.dirname(os.path.abspath(__file__))
server_dir = os.path.dirname(os.path.dirname(script_dir))
sys.path.insert(0, server_dir)

from app.config.database import get_db, engine
from app.models import Base, User, Movie, Theater, Room, Seat, Showtime, Booking, Payment
from app.auth.jwt_auth import get_password_hash

def create_sample_data():
    """Tạo dữ liệu mẫu"""
    
    # Tạo tables nếu chưa có
    Base.metadata.create_all(bind=engine)
    
    db = next(get_db())
    
    try:
        # 1. Tạo Admin User
        admin_user = User(
            email="admin@moviebooking.com",
            username="admin",
            full_name="System Administrator",
            role="admin",
            is_active=True,
            is_verified=True,
            hashed_password=get_password_hash("admin123")
        )
        db.add(admin_user)
        
        # 2. Tạo Customer Users
        customers = [
            User(
                email="john@example.com",
                username="john_doe",
                full_name="John Doe",
                role="customer",
                is_active=True,
                is_verified=True,
                hashed_password=get_password_hash("password123")
            ),
            User(
                email="jane@example.com", 
                username="jane_smith",
                full_name="Jane Smith",
                role="customer",
                is_active=True,
                is_verified=True,
                hashed_password=get_password_hash("password123")
            )
        ]
        db.add_all(customers)
        db.flush()  # Để lấy ID
        
        # 3. Tạo Movies
        movies = [
            Movie(
                title="Avengers: Endgame",
                description="The epic conclusion to the Infinity Saga",
                genre="Action, Adventure, Drama",
                duration=181,
                language="English",
                release_date=date(2019, 4, 26),
                poster_url="https://example.com/avengers.jpg",
                trailer_url="https://youtube.com/watch?v=TcMBFSGVi1c"
            ),
            Movie(
                title="Spider-Man: No Way Home",
                description="Peter Parker's identity is revealed to the world",
                genre="Action, Adventure, Fantasy",
                duration=148,
                language="English", 
                release_date=date(2021, 12, 17),
                poster_url="https://example.com/spiderman.jpg",
                trailer_url="https://youtube.com/watch?v=JfVOs4VSpmA"
            ),
            Movie(
                title="Dune",
                description="A noble family becomes embroiled in a war for control over the galaxy's most valuable asset",
                genre="Adventure, Drama, Sci-Fi",
                duration=155,
                language="English",
                release_date=date(2021, 10, 22),
                poster_url="https://example.com/dune.jpg",
                trailer_url="https://youtube.com/watch?v=n9xhJrPXop4"
            )
        ]
        db.add_all(movies)
        db.flush()
        
        # 4. Tạo Theaters
        theaters = [
            Theater(
                name="CGV Vincom Center",
                city="Ho Chi Minh City",
                address="70-72 Le Thanh Ton, District 1, HCMC"
            ),
            Theater(
                name="Lotte Cinema Landmark 81",
                city="Ho Chi Minh City", 
                address="720A Dien Bien Phu, Binh Thanh District, HCMC"
            ),
            Theater(
                name="Galaxy Cinema Nguyen Du",
                city="Ho Chi Minh City",
                address="116 Nguyen Du, District 1, HCMC"
            )
        ]
        db.add_all(theaters)
        db.flush()
        
        # 5. Tạo Rooms cho mỗi theater
        rooms = []
        for theater in theaters:
            for i in range(1, 4):  # 3 rooms per theater
                room = Room(
                    theater_id=theater.id,
                    name=f"Room {i}",
                    room_type="2D" if i == 1 else "3D" if i == 2 else "IMAX",
                    total_seats=50 if i == 1 else 40 if i == 2 else 30
                )
                rooms.append(room)
        
        db.add_all(rooms)
        db.flush()
        
        # 6. Tạo Seats cho mỗi room
        seats = []
        for room in rooms:
            for row in range(1, 6):  # 5 rows
                for seat_num in range(1, 11):  # 10 seats per row
                    seat = Seat(
                        room_id=room.id,
                        row=chr(64 + row),  # A, B, C, D, E
                        number=seat_num,
                        seat_type="vip" if row <= 2 else "standard",
                        price_modifier=1.5 if row <= 2 else 1.0,
                        is_active=True
                    )
                    seats.append(seat)
        
        db.add_all(seats)
        db.flush()
        
        # 7. Tạo Showtimes
        showtimes = []
        base_time = datetime.now().replace(hour=10, minute=0, second=0, microsecond=0)
        
        for movie in movies:
            for room in rooms:
                for day_offset in range(7):  # 7 days ahead
                    for time_slot in [10, 14, 18, 22]:  # 4 shows per day
                        showtime = Showtime(
                            movie_id=movie.id,
                            room_id=room.id,
                            start_time=base_time + timedelta(days=day_offset, hours=time_slot),
                            end_time=base_time + timedelta(days=day_offset, hours=time_slot + movie.duration//60 + 1),
                            base_price=150000.0,  # 150k VND
                            status="active"
                        )
                        showtimes.append(showtime)
        
        db.add_all(showtimes)
        db.flush()
        
        # 8. Tạo một vài bookings mẫu
        sample_bookings = [
            Booking(
                user_id=customers[0].id,
                showtime_id=showtimes[0].id,
                seat_id=seats[0].id,
                price=150000.0,
                status="confirmed"
            ),
            Booking(
                user_id=customers[1].id,
                showtime_id=showtimes[1].id,
                seat_id=seats[1].id,
                price=150000.0,
                status="pending"
            )
        ]
        db.add_all(sample_bookings)
        
        # 9. Tạo Payment mẫu
        payment = Payment(
            method="momo",
            amount=150000.0,
            status="success",
            created_by=customers[0].id
        )
        db.add(payment)
        db.flush()
        
        # Link payment với booking
        sample_bookings[0].payment_id = payment.id
        
        db.commit()
        print("SUCCESS: Du lieu mau da duoc tao thanh cong!")
        print("\nThong tin dang nhap:")
        print("Admin: admin@moviebooking.com / admin123")
        print("Customer 1: john@example.com / password123")
        print("Customer 2: jane@example.com / password123")
        print(f"\nDa tao {len(movies)} phim, {len(theaters)} rap, {len(rooms)} phong, {len(seats)} ghe, {len(showtimes)} suat chieu")
        
    except Exception as e:
        db.rollback()
        print(f"ERROR: Loi khi tao du lieu: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()

