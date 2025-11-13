#!/bin/bash
# Script to create .env file from .env.example
# Run this script to automatically create .env for client
# Chạy: chmod +x scripts/create-env.sh && ./scripts/create-env.sh (từ thư mục client/)

echo "🎬 Creating .env file for Movie Booking Client..."

# Chuyển về thư mục client nếu đang ở scripts/
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CLIENT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$CLIENT_DIR"

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N) " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        echo "Operation cancelled."
        exit
    fi
fi

# Check if .env.example exists, create it if not
if [ ! -f ".env.example" ]; then
    echo "⚠️  .env.example file not found! Creating .env.example..."
    
    # Create default .env.example content
    cat > .env.example << 'EOF'
# ===========================================
# MOVIE BOOKING CLIENT - ENVIRONMENT VARIABLES
# ===========================================

# ========== API CONFIGURATION ==========
# Backend API base URL
# For local development: http://localhost:8000
# For Docker: http://localhost:8000 (same host, different port)
# For production: Update to your production API URL
VITE_API_BASE_URL=http://localhost:8000
EOF
    
    echo "✅ .env.example file created!"
fi

# Create .env from .env.example
cp .env.example .env
echo "✅ .env file created from .env.example!"

echo ""
echo "Next steps:"
echo "1. Review the .env file and adjust VITE_API_BASE_URL if needed"
echo "2. Run: npm install --legacy-peer-deps"
echo "3. Run: npm run dev"

