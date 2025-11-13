# Script to create .env file from .env.example
# Run this script to automatically create .env for client
# Chạy: .\scripts\create-env.ps1 (từ thư mục client/)

Write-Host "🎬 Creating .env file for Movie Booking Client..." -ForegroundColor Green

# Chuyển về thư mục client nếu đang ở scripts/
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$clientDir = Split-Path -Parent $scriptPath
Set-Location $clientDir

# Check if .env already exists
if (Test-Path ".env") {
    Write-Host "⚠️  .env file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Operation cancelled." -ForegroundColor Red
        exit
    }
}

# Check if .env.example exists, create it if not
if (-not (Test-Path ".env.example")) {
    Write-Host "⚠️  .env.example file not found! Creating .env.example..." -ForegroundColor Yellow
    
    # Create default .env.example content
    $envExampleContent = @"
# ===========================================
# MOVIE BOOKING CLIENT - ENVIRONMENT VARIABLES
# ===========================================

# ========== API CONFIGURATION ==========
# Backend API base URL
# For local development: http://localhost:8000
# For Docker: http://localhost:8000 (same host, different port)
# For production: Update to your production API URL
VITE_API_BASE_URL=http://localhost:8000
"@
    
    Set-Content ".env.example" $envExampleContent
    Write-Host "✅ .env.example file created!" -ForegroundColor Green
}

# Create .env from .env.example
Copy-Item ".env.example" ".env"
Write-Host "✅ .env file created from .env.example!" -ForegroundColor Green

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the .env file and adjust VITE_API_BASE_URL if needed"
Write-Host "2. Run: npm install --legacy-peer-deps" -ForegroundColor Cyan
Write-Host "3. Run: npm run dev" -ForegroundColor Cyan

