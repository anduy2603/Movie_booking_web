# Script to clean and restart Docker containers
# Chạy: .\scripts\command\restart-docker.ps1 (từ thư mục root của project)

Write-Host "=== Cleaning Docker containers and volumes ===" -ForegroundColor Yellow

# Chuyển về thư mục root nếu đang ở scripts/command/
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent (Split-Path -Parent $scriptPath)
Set-Location $rootDir

# Stop and remove containers, networks, and volumes
docker-compose -f docker-compose.dev.yml down -v

Write-Host "`n=== Rebuilding images ===" -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml build --no-cache client

Write-Host "`n=== Starting containers ===" -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml up -d

Write-Host "`n=== Showing logs (Ctrl+C to exit) ===" -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml logs -f

