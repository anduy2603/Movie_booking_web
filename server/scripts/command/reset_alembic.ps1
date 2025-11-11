# PowerShell script để reset Alembic migration
# Chạy script này để reset và tạo migration mới từ đầu
# Chạy: .\scripts\command\reset_alembic.ps1 (từ thư mục server/)

Write-Host "🔄 Reset Alembic Migration Script" -ForegroundColor Cyan
Write-Host ""

# Chuyển về thư mục server nếu đang ở scripts/command/
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverDir = Split-Path -Parent (Split-Path -Parent $scriptPath)
Set-Location $serverDir

# Bước 1: Backup database
$backupName = "movie_booking_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').db"
if (Test-Path "movie_booking.db") {
    Write-Host "📦 Step 1: Backing up database..." -ForegroundColor Yellow
    Copy-Item "movie_booking.db" $backupName
    Write-Host "✅ Database backed up to: $backupName" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database file not found. Continuing anyway..." -ForegroundColor Yellow
}

# Bước 2: Xóa bảng alembic_version
Write-Host ""
Write-Host "🗑️  Step 2: Removing alembic_version table..." -ForegroundColor Yellow
if (Test-Path "movie_booking.db") {
    $sql = "DROP TABLE IF EXISTS alembic_version;"
    $sql | sqlite3 movie_booking.db
    Write-Host "✅ alembic_version table removed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database not found, skipping..." -ForegroundColor Yellow
}

# Bước 3: Backup migrations cũ
Write-Host ""
Write-Host "📁 Step 3: Backing up old migrations..." -ForegroundColor Yellow
if (Test-Path "alembic\versions") {
    $backupDir = "alembic\versions_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    Get-ChildItem "alembic\versions\*.py" | Where-Object { $_.Name -ne "__init__.py" } | 
        ForEach-Object { Copy-Item $_.FullName $backupDir }
    Write-Host "✅ Old migrations backed up to: $backupDir" -ForegroundColor Green
} else {
    Write-Host "⚠️  Versions directory not found" -ForegroundColor Yellow
}

# Bước 4: Xóa migrations cũ (không xóa __init__.py)
Write-Host ""
Write-Host "🗑️  Step 4: Removing old migration files..." -ForegroundColor Yellow
if (Test-Path "alembic\versions") {
    Get-ChildItem "alembic\versions\*.py" | Where-Object { $_.Name -ne "__init__.py" } | Remove-Item
    Write-Host "✅ Old migration files removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Reset completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Create new migration: alembic revision --autogenerate -m 'initial_schema_with_rating'" -ForegroundColor White
Write-Host "   2. Review the generated migration file" -ForegroundColor White
Write-Host "   3. If database already has tables, run: alembic stamp head" -ForegroundColor White
Write-Host "   4. If database is empty, run: alembic upgrade head" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Check the generated migration file before running!" -ForegroundColor Yellow

