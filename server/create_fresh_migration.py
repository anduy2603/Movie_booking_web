#!/usr/bin/env python3
"""
Script để tạo migration mới từ đầu dựa trên models hiện tại
"""
import subprocess
import sys
import os

def run_command(cmd, description):
    """Chạy command và hiển thị output"""
    print(f"\n{'='*60}")
    print(f"📝 {description}")
    print(f"{'='*60}")
    print(f"Running: {cmd}")
    print()
    
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)
    
    if result.returncode != 0:
        print(f"❌ Command failed with return code {result.returncode}", file=sys.stderr)
        return False
    
    return True

def main():
    print("🔄 Creating Fresh Alembic Migration")
    print("="*60)
    
    # Kiểm tra xem đang ở đúng thư mục chưa
    if not os.path.exists("alembic.ini"):
        print("❌ Error: alembic.ini not found!")
        print("   Please run this script from the server directory.")
        sys.exit(1)
    
    # Bước 1: Tạo migration mới
    migration_name = input("\nEnter migration name (default: initial_schema_with_rating): ").strip()
    if not migration_name:
        migration_name = "initial_schema_with_rating"
    
    cmd = f'alembic revision --autogenerate -m "{migration_name}"'
    
    if not run_command(cmd, "Creating new migration from current models"):
        print("\n❌ Failed to create migration")
        sys.exit(1)
    
    print("\n✅ Migration created successfully!")
    print("\n📋 Next steps:")
    print("   1. Review the generated migration file in alembic/versions/")
    print("   2. Make sure it includes the 'rating' column for movies table")
    print("   3. If database already has tables, run: alembic stamp head")
    print("   4. If database is empty, run: alembic upgrade head")
    print("\n⚠️  Important: Review the migration file before running!")

if __name__ == "__main__":
    main()

