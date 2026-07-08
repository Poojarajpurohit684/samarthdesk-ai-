# 🚀 Start Samarthdesk AI

## Quick Start Guide

Follow these steps to run the application locally.

---

## Option 1: Using Docker (Recommended - Easiest)

### Prerequisites:
- Docker Desktop installed
- Docker Compose installed

### Steps:

```bash
# 1. Make sure you're in the project root directory
cd samarthdesk-ai

# 2. Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up

# Wait for all services to start (2-3 minutes first time)
# You'll see: "Server running on port 5000"
```

**That's it!** 🎉

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Database: Running in Docker

**Login with:**
- Admin: `admin@samarthdesk.com` / `Admin@123`
- Agent: `agent@samarthdesk.com` / `Agent@123`
- Customer: `customer@example.com` / `Customer@123`

---

## Option 2: Manual Setup (Without Docker)

### Prerequisites:
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Redis installed and running

### Step 1: Install Dependencies

```bash
# Install all dependencies (root, backend, frontend)
npm install
```

### Step 2: Setup Environment Variables

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# ✅ The .env files are already created with correct values!
```

### Step 3: Setup Database

```bash
# Make sure PostgreSQL is running
# Create database
createdb samarthdesk_ai

# Or using psql:
# psql -U postgres
# CREATE DATABASE samarthdesk_ai;

# Run migrations
cd backend
npx prisma generate
npx prisma migrate dev

# Seed database with test users
npm run db:seed
```

### Step 4: Start Backend

```bash
# In the backend directory
cd backend
npm run dev

# You should see:
# "Server running on port 5000"
# "Database connected successfully"
```

### Step 5: Start Frontend (New Terminal)

```bash
# Open a new terminal
cd frontend
npm run dev

# You should see:
# "Local: http://localhost:5173"
```

### Step 6: Access the Application

Open browser: http://localhost:5173

**Login with:**
- Admin: `admin@samarthdesk.com` / `Admin@123`
- Agent: `agent@samarthdesk.com` / `Agent@123`
- Customer: `customer@example.com` / `Customer@123`

---

## 🔍 Verify Installation

### Check Backend Health

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-..."
}
```

### Check Database Connection

```bash
cd backend
npx prisma studio
```

Opens Prisma Studio (database GUI) at http://localhost:5555

---

## 🎯 What to Try

### As Customer:
1. Login as customer
2. Create a support ticket
3. View your tickets
4. Update ticket details

### As Agent:
1. Login as agent
2. View unassigned tickets
3. Assign ticket to yourself
4. Change ticket status

### As Admin:
1. Login as admin
2. Go to Admin Panel
3. View user management
4. Create new users
5. View ticket statistics

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Windows (PowerShell)
# Kill process on port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# Kill process on port 5173
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process
```

### Database Connection Error

```bash
# Check if PostgreSQL is running
# Windows: Check Services app
# Or restart PostgreSQL service

# Verify DATABASE_URL in backend/.env
# Should be: postgresql://samarthdesk:samarthdesk_password@localhost:5432/samarthdesk_ai
```

### Redis Connection Error

```bash
# Check if Redis is running
# If using Docker for just Redis:
docker run -d -p 6379:6379 redis:7-alpine

# Or install Redis locally
```

### Prisma Errors

```bash
cd backend

# Regenerate Prisma Client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Run migrations
npx prisma migrate dev

# Seed data
npm run db:seed
```

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules
rm -rf backend/node_modules
rm -rf frontend/node_modules

npm install
```

---

## 🛑 Stop the Application

### Using Docker:
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Manual:
```bash
# Press Ctrl+C in each terminal running the servers
```

---

## 📊 Development Tools

### Prisma Studio (Database GUI)
```bash
cd backend
npm run db:studio
# Opens at http://localhost:5555
```

### View Logs (Docker)
```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just frontend
docker-compose logs -f frontend
```

---

## 🎨 Available Scripts

### Root Level:
```bash
npm run dev          # Start both backend and frontend
npm run build        # Build both
npm run test         # Run all tests
npm run lint         # Lint all code
```

### Backend:
```bash
npm run dev          # Development mode with hot reload
npm run build        # Build for production
npm start            # Start production build
npm test             # Run tests
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

### Frontend:
```bash
npm run dev          # Development mode with HMR
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
```

---

## ✅ Success Checklist

After starting, verify:

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173
- [ ] Can login with test accounts
- [ ] Can see dashboard
- [ ] Can create a ticket
- [ ] Can view tickets
- [ ] Admin can access admin panel
- [ ] No console errors

---

## 🚀 Next Steps

Once everything is running:

1. **Explore the App**
   - Try all user roles
   - Create tickets
   - Test features

2. **Customize**
   - Update branding
   - Modify colors in `tailwind.config.js`
   - Add your company name

3. **Deploy**
   - Follow `DEPLOYMENT_COMPLETE_GUIDE.md`
   - Deploy to Railway, Vercel, or Docker

4. **Add Features**
   - Continue with Phase 4-18
   - Add AI features
   - Add real-time chat
   - Add email integration

---

## 📞 Need Help?

- Check `SETUP.md` for detailed setup
- Check `QUICKSTART.md` for quick start
- Check `TROUBLESHOOTING` section above
- Review `PROJECT_COMPLETE.md` for overview

---

**🎉 Enjoy using Samarthdesk AI!**
