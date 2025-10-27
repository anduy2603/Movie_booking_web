#!/bin/bash
# Script to create .env file from env.example
# Run this script to automatically create .env with secure random keys

echo "🎬 Creating .env file for Movie Booking API..."

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
        echo "Operation cancelled."
        exit 0
    fi
fi

# Check if env.example exists
if [ ! -f "env.example" ]; then
    echo "❌ env.example file not found!"
    exit 1
fi

# Copy env.example to .env
cp env.example .env

# Generate secure random keys
echo "🔑 Generating secure keys..."

SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET_KEY=$(openssl rand -hex 32)

# Replace placeholder keys on macOS/Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/SECRET_KEY=CHANGE_THIS_IN_PRODUCTION_YOUR_SECRET_KEY_HERE/SECRET_KEY=$SECRET_KEY/" .env
    sed -i '' "s/JWT_SECRET_KEY=CHANGE_THIS_IN_PRODUCTION_YOUR_JWT_SECRET_KEY_HERE/JWT_SECRET_KEY=$JWT_SECRET_KEY/" .env
else
    # Linux
    sed -i "s/SECRET_KEY=CHANGE_THIS_IN_PRODUCTION_YOUR_SECRET_KEY_HERE/SECRET_KEY=$SECRET_KEY/" .env
    sed -i "s/JWT_SECRET_KEY=CHANGE_THIS_IN_PRODUCTION_YOUR_JWT_SECRET_KEY_HERE/JWT_SECRET_KEY=$JWT_SECRET_KEY/" .env
fi

echo "✅ .env file created successfully!"
echo ""
echo "Next steps:"
echo "1. Review the .env file and adjust settings if needed"
echo "2. Run: docker-compose up --build"
echo "3. Or run locally: uvicorn app.main:app --reload"

