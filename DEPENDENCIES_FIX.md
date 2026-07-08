# 🔧 Dependency Installation Fix

## The Problem
When you tried to run the app, you got errors like:
- Backend: `'tsx' is not recognized`
- Frontend: `Failed to resolve import "react/jsx-dev-runtime"`
- Frontend: `Failed to resolve import "@tanstack/react-query"`

## The Cause
Dependencies weren't installed in the backend and frontend folders.

## The Solution

### Step 1: Clean Everything
```powershell
# Remove all node_modules
Remove-Item -Recurse -Force backend/node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force frontend/node_modules -ErrorAction SilentlyContinue

# Remove lock files
Remove-Item -Force backend/package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Force frontend/package-lock.json -ErrorAction SilentlyContinue
```

### Step 2: Install Backend Dependencies
```powershell
cd backend
npm install
cd ..
```

This installs:
- tsx (TypeScript executor)
- Express, Prisma, JWT, bcrypt
- All backend dependencies

**Wait time:** 2-3 minutes

### Step 3: Install Frontend Dependencies
```powershell
cd frontend  
npm install
cd ..
```

This installs:
- React, React DOM
- Vite
- TanStack Query (React Query)
- Zustand
- Axios
- Tailwind CSS
- All frontend dependencies

**Wait time:** 2-3 minutes

### Step 4: Verify Installation

Backend check:
```powershell
cd backend
npx tsx --version
```

Should show version number.

Frontend check:
```powershell
cd frontend
npm list react
```

Should show React installed.

---

## Quick Fix Command

Run this in PowerShell from project root:

```powershell
# Clean
Remove-Item -Recurse -Force backend/node_modules, frontend/node_modules -ErrorAction SilentlyContinue

# Install backend
cd backend
npm install
cd ..

# Install frontend  
cd frontend
npm install
cd ..

Write-Host "✅ All dependencies installed!" -ForegroundColor Green
```

---

## After Installation

### Start Backend
```powershell
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
```

### Start Frontend (new terminal)
```powershell
cd frontend
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜ Local: http://localhost:5173/
```

---

## Still Having Issues?

### Error: "tsx is not recognized"
**Solution:** Backend dependencies not installed
```powershell
cd backend
rm -r -fo node_modules
npm install
```

### Error: "Failed to resolve import react"
**Solution:** Frontend dependencies not installed
```powershell
cd frontend
rm -r -fo node_modules
npm install
```

### Error: npm install fails
**Solution:** Check your internet connection and try again
```powershell
npm cache clean --force
npm install
```

### Error: Permission denied
**Solution:** Run PowerShell as Administrator

---

## Installation Time

Total time for both:
- Backend install: ~2-3 minutes
- Frontend install: ~2-3 minutes
- **Total: ~5-6 minutes**

---

## What Gets Installed

### Backend (~300 MB)
- 45+ packages
- TypeScript, Express, Prisma
- JWT, bcrypt, validation
- Development tools

### Frontend (~400 MB)
- 200+ packages (React ecosystem)
- React, React DOM, React Router
- Vite build tool
- TanStack Query
- Tailwind CSS
- UI dependencies

### Total Size: ~700 MB

---

## Next Steps After Fix

1. ✅ Dependencies installed
2. 🗄️ Setup database (if not done):
   ```powershell
   cd backend
   npx prisma generate
   npx prisma migrate dev
   npm run db:seed
   ```
3. 🚀 Start servers
4. 🌐 Open http://localhost:5173

---

**You're almost there! Just need to wait for npm install to complete.**
