# Script to create .env file from env.example
# Run this script to automatically create .env with secure random keys

Write-Host "🎬 Creating .env file for Movie Booking API..." -ForegroundColor Green

# Check if .env already exists
if (Test-Path ".env") {
    Write-Host "⚠️  .env file already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Operation cancelled." -ForegroundColor Red
        exit
    }
}

# Read env.example
if (-not (Test-Path "env.example")) {
    Write-Host "❌ env.example file not found!" -ForegroundColor Red
    exit 1
}

# Copy env.example to .env
Copy-Item "env.example" ".env"

# Generate secure random keys
function Get-RandomHexString {
    param([int]$Length = 64)
    $bytes = New-Object byte[] $Length
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    return -join ($bytes | ForEach-Object { $_.ToString("x2") })
}

Write-Host "🔑 Generating secure keys..." -ForegroundColor Cyan

$secretKey = Get-RandomHexString 64
$jwtSecretKey = Get-RandomHexString 64

# Replace placeholder keys
$content = Get-Content ".env" -Raw
$content = $content -replace "SECRET_KEY=CHANGE_THIS_IN_PRODUCTION_YOUR_SECRET_KEY_HERE", "SECRET_KEY=$secretKey"
$content = $content -replace "JWT_SECRET_KEY=CHANGE_THIS_IN_PRODUCTION_YOUR_JWT_SECRET_KEY_HERE", "JWT_SECRET_KEY=$jwtSecretKey"

Set-Content ".env" $content

Write-Host "✅ .env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the .env file and adjust settings if needed"
Write-Host "2. Run: docker-compose up --build" -ForegroundColor Cyan
Write-Host "3. Or run locally: uvicorn app.main:app --reload" -ForegroundColor Cyan

