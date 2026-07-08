# 🚀 RUN THE APPLICATION NOW

## Quick 3-Step Process

### Prerequisites Check
- ✅ Node.js v22.17.1 installed
- ✅ npm 10.9.2 installed  
- ❌ PostgreSQL NOT installed yet
- ❌ Docker NOT available

---

## OPTION 1: Install PostgreSQL First (Recommended)

### Step 1: Install PostgreSQL (5 minutes)

1. Download PostgreSQL 15:
   - Visit: https://www.postgresql.org/download/windows/
   - Download: `postgresql-15.x-windows-x64.exe`
   - Run installer

2. During installation:
   - Password: `samarthdesk_password` (or any password you remember)
   - Port: `5432`
   - Click Next → Next → Install

3. PostgreSQL will start automatically as a Windows service

### Step 2: Run Quick Start Script

Open PowerShell in project root and run:

```powershell
.\quick-start.ps1
```

This script will:
- ✅ Check all dependencies
- ✅ Install npm packages
- ✅ Generate Prisma Client
- ✅ Create database tables
- ✅ Seed test users

### Step 3: Start Application

**Terminal 1 (Backend):**
```powershell
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```powershell
cd frontend  
npm run dev
```

**Then open:** http://localhost:5173

---

## OPTION 2: Manual Step-by-Step

If the quick start script doesn't work, follow these manual steps:

### 1. Install Dependencies
```powershell
npm install
```

### 2. Setup Backend
```powershell
cd backend

# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Add test users
npm run db:seed
```

### 3. Start Backend
```powershell
npm run dev
```

Keep this terminal open. You should see:
```
🚀 Server running on port 5000
✅ Database connected successfully
```

### 4. Start Frontend (NEW Terminal)
```powershell
cd frontend
npm run dev
```

You should see:
```
➜  Local:   http://localhost:5173/
```

### 5. Open Browser
Go to: http://localhost:5173

---

## OPTION 3: Using Docker (If you install Docker Desktop)

If you want to use Docker instead:

1. Install Docker Desktop:
   - Download from: https://www.docker.com/products/docker-desktop
   - Install and restart computer
   - Start Docker Desktop

2. Run:
```powershell
docker-compose up
```

That's it! Everything (PostgreSQL, Redis, Backend, Frontend) will start automatically.

---

## 🔐 Login Credentials

Once the app is running, login with:

**Admin:**
- Email: `admin@samarthdesk.com`
- Password: `Admin@123`

**Agent:**
- Email: `agent@samarthdesk.com`
- Password: `Agent@123`

**Customer:**
- Email: `customer@example.com`
- Password: `Customer@123`

---

## 🐛 Common Issues

### "Cannot connect to database"

**Problem:** PostgreSQL not installed or not running

**Solution:**
1. Install PostgreSQL (see Step 1 above)
2. Or check if service is running:
   ```powershell
   Get-Service -Name postgresql*
   ```
3. Start service if stopped:
   ```powershell
   Start-Service -Name postgresql-x64-15
   ```

### "Port 5000 already in use"

**Solution:**
```powershell
# Find and kill process on port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

### "Prisma migration failed"

**Solution:**
1. Make sure PostgreSQL is running
2. Check `backend/.env` file - DATABASE_URL should match your PostgreSQL password
3. Create database manually:
   ```powershell
   psql -U postgres
   CREATE DATABASE samarthdesk_ai;
   \q
   ```

### "Module not found"

**Solution:**
```powershell
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules, backend/node_modules, frontend/node_modules
npm install
```

---

## ✅ Success Checklist

You'll know it's working when:

- [ ] Backend terminal shows: "Server running on port 5000"
- [ ] Frontend terminal shows: "Local: http://localhost:5173"
- [ ] Browser opens the login page
- [ ] You can login with test credentials
- [ ] No red errors in console

---

## 🎯 What to Test First

### 1. Login as Customer
- Email: `customer@example.com`
- Password: `Customer@123`
- Create a new ticket
- View your tickets

### 2. Login as Agent
- Email: `agent@samarthdesk.com`  
- Password: `Agent@123`
- View all tickets
- Change ticket status
- Assign ticket to yourself

### 3. Login as Admin
- Email: `admin@samarthdesk.com`
- Password: `Admin@123`
- Go to Admin Panel (sidebar)
- View User Management
- Create new users
- View statistics

---

## 📚 More Help

- **Detailed Installation:** See `INSTALL_GUIDE.md`
- **Startup Instructions:** See `START.md`
- **Features Overview:** See `PROJECT_COMPLETE.md`
- **Deployment:** See `DEPLOYMENT_COMPLETE_GUIDE.md`

---

## 🚀 Ready to Start?

Choose your path:

1. **Easiest:** Install PostgreSQL → Run `.\quick-start.ps1`
2. **Manual:** Follow OPTION 2 above step-by-step
3. **Docker:** Install Docker Desktop → Run `docker-compose up`

**The app is ready to run - just need PostgreSQL installed!**

---

## 💡 Pro Tips

- Use **pgAdmin** (installed with PostgreSQL) to view database GUI
- Use `npx prisma studio` to view/edit database records
- Press `Ctrl+C` in terminals to stop servers
- Keep both terminals open while using the app

---

**🎉 Let's get you running! Start with OPTION 1 above.**
