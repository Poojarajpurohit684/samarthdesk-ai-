# 🛠️ Manual Setup Guide (Step-by-Step)

## Issue: Dependencies Installation

There seems to be an issue with the workspace npm configuration. Let's install dependencies manually.

---

## Step 1: Install Backend Dependencies

Open PowerShell and run these commands:

```powershell
cd "C:\Users\rkdbc\Desktop\Enjay Claude Course\backend"

npm install --save @prisma/client bcryptjs cors dotenv express express-rate-limit helmet ioredis jsonwebtoken multer nodemailer socket.io winston zod ai bullmq

npm install --save-dev @types/bcryptjs @types/cors @types/express @types/jsonwebtoken @types/multer @types/node @types/nodemailer @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint prettier prisma tsx typescript vitest
```

---

## Step 2: Install Frontend Dependencies

```powershell
cd "C:\Users\rkdbc\Desktop\Enjay Claude Course\frontend"

npm install --save react react-dom react-router-dom axios zustand @tanstack/react-query react-hook-form @hookform/resolvers zod clsx react-hot-toast socket.io-client ai

npm install --save-dev @types/react @types/react-dom @types/node @vitejs/plugin-react vite typescript tailwindcss postcss autoprefixer eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks eslint-plugin-react-refresh vitest @playwright/test
```

---

## Step 3: Generate Prisma Client

```powershell
cd "C:\Users\rkdbc\Desktop\Enjay Claude Course\backend"

npx prisma generate
```

---

## Step 4: Setup Database (Install PostgreSQL First!)

### 4a. Install PostgreSQL
1. Download from: https://www.postgresql.org/download/windows/
2. Install with password: `samarthdesk_password`
3. Port: `5432`

### 4b. Create Database

Option A - Using psql:
```powershell
psql -U postgres
CREATE DATABASE samarthdesk_ai;
\q
```

Option B - Using pgAdmin (GUI):
- Open pgAdmin
- Right-click Databases → Create → Database
- Name: `samarthdesk_ai`
- Save

### 4c. Run Migrations
```powershell
cd "C:\Users\rkdbc\Desktop\Enjay Claude Course\backend"

npx prisma migrate dev --name init
```

### 4d. Seed Test Users
```powershell
npm run db:seed
```

You should see:
```
✅ Seeded 3 test users:
- admin@samarthdesk.com
- agent@samarthdesk.com
- customer@example.com
```

---

## Step 5: Start the Application

### Terminal 1 - Backend
```powershell
cd "C:\Users\rkdbc\Desktop\Enjay Claude Course\backend"
npm run dev
```

Wait for:
```
🚀 Server running on port 5000
✅ Database connected
```

**Keep this terminal open!**

###Terminal 2 - Frontend
Open a NEW PowerShell window:

```powershell
cd "C:\Users\rkdbc\Desktop\Enjay Claude Course\frontend"
npm run dev
```

Wait for:
```
➜ Local: http://localhost:5173/
```

**Keep this terminal open!**

---

## Step 6: Open Browser

Go to: **http://localhost:5173**

### Login Credentials:

**Admin:**
```
Email: admin@samarthdesk.com
Password: Admin@123
```

**Agent:**
```
Email: agent@samarthdesk.com
Password: Agent@123
```

**Customer:**
```
Email: customer@example.com
Password: Customer@123
```

---

## Troubleshooting

### Still getting "tsx not recognized"?

Install tsx globally:
```powershell
npm install -g tsx
```

Then try starting backend again.

### Still getting "Cannot find module 'react'"?

Make sure you're in the frontend folder:
```powershell
cd "C:\Users\rkdbc\Desktop\Enjay Claude Course\frontend"
npm install
npm run dev
```

### Prisma errors?

```powershell
cd backend
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

### Port already in use?

```powershell
# Kill port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force

# Kill port 5173
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

---

## Quick Command Summary

### Full Setup from Scratch:
```powershell
# Backend
cd "C:\Users\rkdbc\Desktop\Enjay Claude Course\backend"
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed

# Frontend (new terminal)
cd "C:\Users\rkdbc\Desktop\Enjay Claude Course\frontend"
npm install

# Start Backend (terminal 1)
cd "C:\Users\rkdbc\Desktop\Enjay Claude Course\backend"
npm run dev

# Start Frontend (terminal 2)
cd "C:\Users\rkdbc\Desktop\Enjay Claude Course\frontend"
npm run dev
```

---

## Alternative: Use Global node_modules

If local installation keeps failing, install packages globally:

```powershell
npm install -g tsx prisma @prisma/client

cd backend
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm run dev
```

---

## Success Checklist

- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] PostgreSQL installed and running
- [ ] Prisma Client generated
- [ ] Database migrated
- [ ] Test users seeded
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:5173
- [ ] Can open application in browser
- [ ] Can login with test accounts

---

**If you're still having issues, let me know which step is failing!**
