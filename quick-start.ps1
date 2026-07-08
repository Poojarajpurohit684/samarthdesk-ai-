# Samarthdesk AI - Quick Start Script for Windows
# Run this script in PowerShell

Write-Host "🚀 Samarthdesk AI - Quick Start" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
    if ($pgService) {
        Write-Host "✅ PostgreSQL service found: $($pgService.Name)" -ForegroundColor Green
        if ($pgService.Status -ne "Running") {
            Write-Host "⚠️  PostgreSQL is not running. Starting..." -ForegroundColor Yellow
            Start-Service -Name $pgService.Name
            Write-Host "✅ PostgreSQL started" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  PostgreSQL not found as a service" -ForegroundColor Yellow
        Write-Host "   Please install PostgreSQL from https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
        Write-Host "   Or check INSTALL_GUIDE.md for detailed instructions" -ForegroundColor Yellow
        $continue = Read-Host "Continue anyway? (y/n)"
        if ($continue -ne "y") { exit 1 }
    }
} catch {
    Write-Host "⚠️  Could not check PostgreSQL service" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Installing Dependencies..." -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Install dependencies
Write-Host "Running: npm install" -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Setup backend
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setting up Backend..." -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Set-Location backend

# Generate Prisma Client
Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Prisma Client generated" -ForegroundColor Green
Write-Host ""

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
Write-Host "(This will create the database tables)" -ForegroundColor Gray
npx prisma migrate dev --name init

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to run migrations" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure PostgreSQL is running" -ForegroundColor Gray
    Write-Host "2. Check backend/.env file for correct DATABASE_URL" -ForegroundColor Gray
    Write-Host "3. Create database manually: CREATE DATABASE samarthdesk_ai;" -ForegroundColor Gray
    Write-Host "4. See INSTALL_GUIDE.md for detailed instructions" -ForegroundColor Gray
    Set-Location ..
    exit 1
}

Write-Host "✅ Database migrations completed" -ForegroundColor Green
Write-Host ""

# Seed database
Write-Host "Seeding database with test users..." -ForegroundColor Yellow
npm run db:seed

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Failed to seed database (you can do this manually later)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Database seeded" -ForegroundColor Green
}

Set-Location ..
Write-Host ""

# Success message
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start Backend (in this terminal):" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "2. Start Frontend (in a NEW terminal):" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "3. Open browser: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Login Credentials:" -ForegroundColor Cyan
Write-Host "   Admin:    admin@samarthdesk.com / Admin@123" -ForegroundColor White
Write-Host "   Agent:    agent@samarthdesk.com / Agent@123" -ForegroundColor White
Write-Host "   Customer: customer@example.com / Customer@123" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - INSTALL_GUIDE.md (detailed setup)" -ForegroundColor White
Write-Host "   - START.md (startup guide)" -ForegroundColor White
Write-Host "   - PROJECT_COMPLETE.md (feature overview)" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Happy coding!" -ForegroundColor Green
Write-Host ""
