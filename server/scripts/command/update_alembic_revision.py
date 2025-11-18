"""Cập nhật revision trong alembic_version về add_hashed_password"""
from sqlalchemy import text
from app.config.database import engine

with engine.begin() as conn:
    # Kiểm tra revision hiện tại
    result = conn.execute(text("SELECT version_num FROM alembic_version"))
    current = result.fetchone()
    
    if current:
        print(f"Revision hiện tại: {current[0]}")
        if current[0] != 'add_hashed_password':
            # Cập nhật về add_hashed_password
            conn.execute(text("UPDATE alembic_version SET version_num = 'add_hashed_password'"))
            print("✓ Đã cập nhật revision về: add_hashed_password")
        else:
            print("✓ Revision đã đúng: add_hashed_password")
    else:
        # Nếu chưa có, insert mới
        conn.execute(text("INSERT INTO alembic_version (version_num) VALUES ('add_hashed_password')"))
        print("✓ Đã tạo revision: add_hashed_password")

print("\n✓ Hoàn tất!")

