# PostgreSQL Automated Installer for Samarthdesk AI
# This script helps download and provides instructions for PostgreSQL installation

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "   PostgreSQL Installer for Samarthdesk AI    " -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is already installed
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue

if ($pgService) {
    Write-Host "✅ PostgreSQL is already installed!" -ForegroundColor Green
    Write-Host "Service Name: $($pgService.Name)" -ForegroundColor Yellow
    Write-Host "Status: $($pgService.Status)" -ForegroundColor Yellow
    Write-Host ""
    
    if ($pgService.Status -ne "Running") {
        Write-Host "⚠️  PostgreSQL service is not running. Starting it..." -ForegroundColor Yellow
        try {
            Start-Service -Name $pgService.Name
            Write-Host "✅ PostgreSQL service started successfully!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to start PostgreSQL service. Try manually:" -ForegroundColor Red
            Write-Host "   Start-Service -Name $($pgService.Name)" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run: cd backend" -ForegroundColor White
    Write-Host "2. Run: npx prisma generate" -ForegroundColor White
    Write-Host "3. Run: npx prisma migrate dev" -ForegroundColor White
    Write-Host "4. Run: npm run db:seed" -ForegroundColor White
    Write-Host "5. Run: npm run dev" -ForegroundColor White
    Write-Host ""
    exit 0
}

Write-Host "❌ PostgreSQL is not installed on your system." -ForegroundColor Red
Write-Host ""

# Offer to open download page
Write-Host "I can help you install PostgreSQL. Here are your options:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Download Installer (Recommended)" -ForegroundColor Yellow
Write-Host "  - Most reliable method" -ForegroundColor Gray
Write-Host "  - Easy GUI installation" -ForegroundColor Gray
Write-Host "  - Runs automatically as Windows service" -ForegroundColor Gray
Write-Host ""

Write-Host "Option 2: Use Chocolatey (If you have it)" -ForegroundColor Yellow
Write-Host "  - Quick command-line install" -ForegroundColor Gray
Write-Host "  - Requires Chocolatey package manager" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Enter choice (1 or 2, or 'exit' to quit)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Opening PostgreSQL download page..." -ForegroundColor Green
        Start-Process "https://www.postgresql.org/download/windows/"
        Write-Host ""
        Write-Host "📋 Installation Instructions:" -ForegroundColor Cyan
        Write-Host "1. Click 'Download the installer'" -ForegroundColor White
        Write-Host "2. Download: postgresql-15.x-windows-x64.exe" -ForegroundColor White
        Write-Host "3. Run the installer" -ForegroundColor White
        Write-Host "4. IMPORTANT: Set password to: samarthdesk_password" -ForegroundColor Yellow
        Write-Host "   (Or remember your password and update backend/.env)" -ForegroundColor Gray
        Write-Host "5. Port: Keep default 5432" -ForegroundColor White
        Write-Host "6. Click Next → Next → Install" -ForegroundColor White
        Write-Host "7. Uncheck 'Stack Builder' at the end" -ForegroundColor White
        Write-Host ""
        Write-Host "After installation, run this script again!" -ForegroundColor Cyan
    }
    
    "2" {
        Write-Host ""
        Write-Host "Checking if Chocolatey is installed..." -ForegroundColor Yellow
        
        $chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue
        
        if ($chocoInstalled) {
            Write-Host "✅ Chocolatey found!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Installing PostgreSQL via Chocolatey..." -ForegroundColor Yellow
            Write-Host "This may take 5-10 minutes..." -ForegroundColor Gray
            Write-Host ""
            
            try {
                choco install postgresql15 --params '/Password:samarthdesk_password' -y
                Write-Host ""
                Write-Host "✅ PostgreSQL installed successfully!" -ForegroundColor Green
                Write-Host ""
                Write-Host "Refreshing environment..." -ForegroundColor Yellow
                $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
                
                Write-Host ""
                Write-Host "Next steps:" -ForegroundColor Cyan
                Write-Host "1. Run: cd backend" -ForegroundColor White
                Write-Host "2. Run: npx prisma generate" -ForegroundColor White
                Write-Host "3. Run: npx prisma migrate dev" -ForegroundColor White
                Write-Host "4. Run: npm run db:seed" -ForegroundColor White
                Write-Host "5. Run: npm run dev" -ForegroundColor White
            } catch {
                Write-Host "❌ Installation failed: $_" -ForegroundColor Red
                Write-Host "Try Option 1 (manual download) instead." -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ Chocolatey is not installed." -ForegroundColor Red
            Write-Host ""
            Write-Host "To install Chocolatey, run:" -ForegroundColor Yellow
            Write-Host 'Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString("https://community.chocolatey.org/install.ps1"))' -ForegroundColor Gray
            Write-Host ""
            Write-Host "Or use Option 1 (recommended for beginners)." -ForegroundColor Yellow
        }
    }
    
    default {
        Write-Host "Exiting..." -ForegroundColor Gray
        exit 0
    }
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "After PostgreSQL is installed, run:" -ForegroundColor Cyan
Write-Host "  .\quick-start.ps1" -ForegroundColor White
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
