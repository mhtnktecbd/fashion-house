# Fix Prisma EPERM Error Script
Write-Host "🔧 Starting Prisma Repair..." -ForegroundColor Cyan

# 1. Stop Node processes to release file locks
Write-Host "1. Stopping Node.js processes..." -ForegroundColor Yellow
try {
    Stop-Process -Name "node" -ErrorAction SilentlyContinue -Force
    Write-Host "   ✔ Node processes stopped." -ForegroundColor Green
} catch {
    Write-Host "   ℹ No Node processes were running." -ForegroundColor Gray
}

# 2. Wait a moment for locks to release
Start-Sleep -Seconds 2

# 3. Remove the localized .prisma folder
$PrismaCache = "node_modules\.prisma"
if (Test-Path $PrismaCache) {
    Write-Host "2. Removing Prisma cache ($PrismaCache)..." -ForegroundColor Yellow
    try {
        Remove-Item -Path $PrismaCache -Recurse -Force -ErrorAction Stop
        Write-Host "   ✔ Cache removed." -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed to remove cache. Please close VSCode and try again." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ℹ No cache found to remove." -ForegroundColor Gray
}

# 4. Regenerate Prisma Client
Write-Host "3. Regenerating Prisma Client..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "   ✔ Prisma Client generated successfully!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Prisma generation failed." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Repair Complete! You can now run 'npm run dev' again." -ForegroundColor Cyan
