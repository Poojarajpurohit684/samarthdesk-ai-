# Fix Dependencies Script for Samarthdesk AI

Write-Host "🔧 Fixing Dependencies..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Not in project root directory" -ForegroundColor Red
    Write-Host "Please run this script from the project root folder" -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Cleaning old installations..." -ForegroundColor Yellow
Write-Host ""

# Remove node_modules
if (Test-Path "node_modules") {
    Write-Host "Removing root node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}

if (Test-Path "backend/node_modules") {
    Write-Host "Removing backend/node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "backend/node_modules" -ErrorAction SilentlyContinue
}

if (Test-Path "frontend/node_modules") {
    Write-Host "Removing frontend/node_modules..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "frontend/node_modules" -ErrorAction SilentlyContinue
}

# Remove package-lock files
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
}
if (Test-Path "backend/package-lock.json") {
    Remove-Item -Force "backend/package-lock.json" -ErrorAction SilentlyContinue
}
if (Test-Path "frontend/package-lock.json") {
    Remove-Item -Force "frontend/package-lock.json" -ErrorAction SilentlyContinue
}

Write-Host "✅ Cleanup complete" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Installing backend dependencies..." -ForegroundColor Yellow
Write-Host ""

Set-Location backend
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Installing frontend dependencies..." -ForegroundColor Yellow
Write-Host ""

Set-Location frontend
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ Dependencies Fixed Successfully!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start Backend (Terminal 1):" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "2. Start Frontend (Terminal 2):" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Open browser: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎉 You're ready to go!" -ForegroundColor Green
Write-Host ""
