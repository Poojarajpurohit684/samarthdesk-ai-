# 🚀 Installation & Startup Guide for Windows

## Prerequisites Installation

Since Docker is not available, we'll set up everything manually.

### Step 1: Install PostgreSQL

1. Download PostgreSQL 15 for Windows:
   - Go to: https://www.postgresql.org/download/windows/
   - Download the installer (postgresql-15.x-x-windows-x64.exe)
   - Run the installer

2. During installation:
   - Set password: `samarthdesk_password` (or remember your password)
   - Port: `5432` (default)
   - Install all components

3. After installation, PostgreSQL should be running as a Windows service

### Step 2: Install Redis (Optional but Recommended)

**Option A: Using WSL (Windows Subsystem for Linux)**
```powershell
# Install WSL if not already installed
wsl --install

# In WSL terminal:
sudo apt-get update
sudo apt-get install redis-server
sudo service redis-server start
```

**Option B: Skip Redis for now**
We can run without Redis initially. The app will still work.

---

## Database Setup

### 1. Create Database

Open PowerShell as Administrator:

```powershell
# Connect to PostgreSQL
psql -U postgres

# Inside psql, create database:
CREATE DATABASE samarthdesk_ai;

# Create user
CREATE USER samarthdesk WITH PASSWORD 'samarthdesk_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE samarthdesk_ai TO samarthdesk;

# Exit psql
\q
```

**OR** Use pgAdmin (GUI tool installed with PostgreSQL):
- Open pgAdmin
- Right-click on "Databases" → Create → Database
- Name: `samarthdesk_ai`
- Owner: postgres
- Save

---

## Application Setup

### 1. Install Dependencies

```powershell
# In project root
npm install
```

This will install dependencies for both backend and frontend.

### 2. Setup Backend

```powershell
cd backend

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with test users
npm run db:seed
```

Expected output:
```
✅ Database migrations completed
✅ Test users created:
   - admin@samarthdesk.com / Admin@123
   - agent@samarthdesk.com / Agent@123
   - customer@example.com / Customer@123
```

---

## Start the Application

### Terminal 1: Start Backend

```powershell
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
✅ Database connected successfully
```

If you see errors, check the troubleshooting section below.

### Terminal 2: Start Frontend (Open NEW Terminal)

```powershell
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Access the Application

Open your browser and go to: **http://localhost:5173**

### Login Credentials:

**Admin Account:**
- Email: `admin@samarthdesk.com`
- Password: `Admin@123`

**Agent Account:**
- Email: `agent@samarthdesk.com`
- Password: `Agent@123`

**Customer Account:**
- Email: `customer@example.com`
- Password: `Customer@123`

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

1. Check PostgreSQL is running:
   ```powershell
   # Check if PostgreSQL service is running
   Get-Service -Name postgresql*
   ```

2. If not running, start it:
   ```powershell
   Start-Service -Name postgresql-x64-15
   ```

3. Verify connection string in `backend/.env`:
   ```
   DATABASE_URL=postgresql://samarthdesk:samarthdesk_password@localhost:5432/samarthdesk_ai
   ```

   If you used different credentials, update them.

### Error: "Port 5000 already in use"

```powershell
# Find process using port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess

# Kill the process (replace PID with actual process ID)
Stop-Process -Id PID -Force
```

### Error: "Port 5173 already in use"

```powershell
# Find and kill process on port 5173
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

### Prisma Errors

```powershell
cd backend

# Delete existing migrations and start fresh
Remove-Item -Recurse -Force prisma/migrations

# Regenerate everything
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

### Module Not Found Errors

```powershell
# Clear all node_modules and reinstall
Remove-Item -Recurse -Force node_modules, backend/node_modules, frontend/node_modules

# Reinstall
npm install
```

---

## 🧪 Verify Installation

### 1. Check Backend Health

Open browser or use PowerShell:
```powershell
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-07-04T..."
}
```

### 2. Check Database

```powershell
cd backend
npx prisma studio
```

This opens Prisma Studio at http://localhost:5555
You should see 3 users in the User table.

---

## 🎯 What to Test

### As Customer:
1. Login with: `customer@example.com` / `Customer@123`
2. Create a new ticket
3. View your tickets
4. Click on a ticket to see details

### As Agent:
1. Logout and login with: `agent@samarthdesk.com` / `Agent@123`
2. View all tickets
3. Assign a ticket to yourself
4. Change ticket status

### As Admin:
1. Logout and login with: `admin@samarthdesk.com` / `Admin@123`
2. Go to Admin Panel (sidebar)
3. View User Management
4. Create new user
5. View ticket statistics in Overview

---

## 📊 Useful Commands

### Backend Commands:
```powershell
cd backend

# Development mode with hot reload
npm run dev

# Run tests
npm test

# Open database GUI
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed test data
npm run db:seed
```

### Frontend Commands:
```powershell
cd frontend

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🛑 Stop the Application

Simply press `Ctrl + C` in each terminal window.

---

## 🔄 Restart PostgreSQL Service

If you need to restart PostgreSQL:

```powershell
# Restart PostgreSQL
Restart-Service -Name postgresql-x64-15

# Or stop and start
Stop-Service -Name postgresql-x64-15
Start-Service -Name postgresql-x64-15
```

---

## ✅ Installation Checklist

After following this guide, verify:

- [ ] PostgreSQL installed and running
- [ ] Database `samarthdesk_ai` created
- [ ] Node.js and npm working
- [ ] All dependencies installed (`npm install` successful)
- [ ] Prisma migrations completed
- [ ] Database seeded with test users
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:5173
- [ ] Can access application in browser
- [ ] Can login with test accounts
- [ ] No console errors

---

## 🚀 Next Steps

Once everything is running:

1. **Test All Features**
   - Create tickets
   - Manage users (admin)
   - Test different roles

2. **Customize**
   - Update branding
   - Change colors
   - Add your company info

3. **Continue Development**
   - Add AI features (Phase 4-7)
   - Add real-time updates (Phase 8-9)
   - Add email integration (Phase 10-11)

4. **Deploy to Production**
   - See `DEPLOYMENT_COMPLETE_GUIDE.md`
   - Deploy to Railway, Vercel, or your own server

---

## 📞 Need More Help?

- **Setup Issues**: Check `SETUP.md`
- **Quick Start**: Check `QUICKSTART.md`
- **Deployment**: Check `DEPLOYMENT_COMPLETE_GUIDE.md`
- **Features**: Check `PROJECT_COMPLETE.md`

---

**🎉 You're all set! Enjoy building with Samarthdesk AI!**
