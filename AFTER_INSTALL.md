# ✅ After Dependencies Install - Next Steps

## How to Know Installation is Complete

Check your terminal windows:
- When you see `PS C:\Users\rkdbc\Desktop\Enjay Claude Course\backend>` → Backend done
- When you see `PS C:\Users\rkdbc\Desktop\Enjay Claude Course\frontend>` → Frontend done

---

## Step 1: Setup Database

```powershell
cd backend
```

### Generate Prisma Client
```powershell
npx prisma generate
```

You should see:
```
✔ Generated Prisma Client
```

### Run Database Migrations
```powershell
npx prisma migrate dev --name init
```

You should see:
```
✔ Database migrations applied
```

If you get an error about PostgreSQL not being installed, you need to install it first:
- Download from: https://www.postgresql.org/download/windows/
- Password: `samarthdesk_password`
- Port: `5432`

### Seed Test Users
```powershell
npm run db:seed
```

You should see:
```
✅ Seeded 3 users
```

### Go back to root
```powershell
cd ..
```

---

## Step 2: Start the Application

### Terminal 1 - Start Backend

```powershell
cd backend
npm run dev
```

**Success looks like:**
```
🚀 Server running on port 5000
✅ Database connected successfully
```

**Leave this terminal open!**

### Terminal 2 - Start Frontend (New Terminal Window)

Open a NEW PowerShell window, then:

```powershell
cd "C:\Users\rkdbc\Desktop\Enjay Claude Course"
cd frontend
npm run dev
```

**Success looks like:**
```
VITE v6.4.1 ready in 249 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.2:5173/
```

**Leave this terminal open too!**

---

## Step 3: Open Browser

Open your browser and go to:

```
http://localhost:5173
```

You should see the Samarthdesk AI login page!

---

## Step 4: Login and Test

### Test as Customer
1. Login:
   - Email: `customer@example.com`
   - Password: `Customer@123`
2. Create a new ticket
3. View your tickets

### Test as Agent (Logout first)
1. Login:
   - Email: `agent@samarthdesk.com`
   - Password: `Agent@123`
2. View all tickets
3. Assign a ticket to yourself
4. Change ticket status

### Test as Admin (Logout first)
1. Login:
   - Email: `admin@samarthdesk.com`
   - Password: `Admin@123`
2. Go to Admin Panel (sidebar)
3. Click "User Management"
4. Create a new user
5. View statistics in "Overview"

---

## Troubleshooting

### Error: "Cannot connect to database"

**Problem:** PostgreSQL not installed or not running

**Solution 1 - Check if running:**
```powershell
Get-Service -Name postgresql*
```

**Solution 2 - Start PostgreSQL:**
```powershell
Start-Service -Name postgresql-x64-15
```

**Solution 3 - Install PostgreSQL:**
- Download: https://www.postgresql.org/download/windows/
- Install with password: `samarthdesk_password`
- Port: `5432`

Then run migrations again:
```powershell
cd backend
npx prisma migrate dev
npm run db:seed
```

### Error: "Port 5000 already in use"

**Solution:**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

Then start backend again.

### Error: "Port 5173 already in use"

**Solution:**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

Then start frontend again.

### Backend won't start - still says "tsx not found"

**Solution:** Backend dependencies didn't install properly
```powershell
cd backend
Remove-Item -Recurse -Force node_modules
npm install
```

### Frontend shows blank page or errors

**Solution:** Frontend dependencies didn't install properly
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
```

Then restart frontend:
```powershell
npm run dev
```

---

## Quick Command Reference

### Start Application (after first setup)
```powershell
# Terminal 1
cd backend
npm run dev

# Terminal 2  
cd frontend
npm run dev
```

### Stop Application
Press `Ctrl + C` in each terminal

### View Database
```powershell
cd backend
npx prisma studio
```

Opens GUI at http://localhost:5555

### Reset Database (if needed)
```powershell
cd backend
npx prisma migrate reset
npm run db:seed
```

**WARNING:** This deletes all data!

---

## Success Checklist

After following all steps, you should have:

- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] PostgreSQL running
- [ ] Database created and migrated
- [ ] Test users seeded
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can open http://localhost:5173
- [ ] Can login with test accounts
- [ ] Can see dashboard
- [ ] Can create tickets
- [ ] No console errors

---

## 🎉 You're Done!

Once everything is working:

1. **Explore the features**
   - Create tickets
   - Update ticket status
   - Manage users (as admin)
   - View statistics

2. **Customize**
   - Update branding in the code
   - Change colors in Tailwind config
   - Add your company name

3. **Deploy** (when ready)
   - See `DEPLOYMENT_COMPLETE_GUIDE.md`
   - Deploy to Railway, Vercel, or Docker

---

**Need help? Check:**
- `DEPENDENCIES_FIX.md` - Installation issues
- `INSTALL_GUIDE.md` - Complete setup guide
- `PROJECT_COMPLETE.md` - Feature overview
- `START_HERE.md` - Quick start

**Happy coding! 🚀**
