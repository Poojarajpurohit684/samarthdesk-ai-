# 🎯 Samarthdesk AI

**AI-Powered Customer Support Ticketing System**

[![Status](https://img.shields.io/badge/Status-Ready_to_Run-success)]()
[![Node](https://img.shields.io/badge/Node.js-18+-green)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)]()
[![License](https://img.shields.io/badge/License-MIT-yellow)]()

---

## 🚀 Quick Start

**Want to run this NOW?** → Open **[START_HERE.md](./START_HERE.md)** 👈

**3 Simple Steps:**
1. Install PostgreSQL (10 min)
2. Run `.\quick-start.ps1` (5 min)
3. Start backend & frontend (2 min)

**Total: 17 minutes from zero to running application! 🎉**

---

## ✨ Current Features (Ready to Use)

### ✅ Fully Implemented
- **🔐 Multi-role Authentication** (Customer, Agent, Admin)
  - JWT with refresh tokens
  - Password reset & email verification
  - Role-based access control (RBAC)
  
- **🎫 Ticket Management System**
  - Full CRUD operations
  - Auto ticket numbering (TKT-XXXXX-XXXX)
  - Status workflow & priority levels
  - Role-based ticket visibility
  - Search & filtering
  - Ticket assignment to agents
  
- **👥 User Management**
  - Profile management
  - Admin dashboard
  - User CRUD operations
  - User statistics
  - Activate/Deactivate users

- **📊 Statistics & Analytics**
  - Ticket counts by status
  - User statistics
  - Category analytics
  - Priority analytics

### 🚧 Coming Soon (Not Yet Implemented)
- **AI-Powered Features**:
  - Ticket Summarization
  - Smart Reply Generation
  - Grammar & Tone Improvement
  - Auto Classification
  - Priority Detection
  - Auto Resolution
- **Real-time Updates** via WebSocket
- **Email Integration** (Send & Receive)
- **Advanced Analytics Dashboard**
- **Background Job Processing**

## Tech Stack

### Frontend
- React + TypeScript + Vite
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form + Zod

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Socket.io

### AI
- Vercel AI SDK
- OpenAI / Anthropic compatible models

## 🎯 Getting Started

### 🏃‍♂️ Fastest Way to Run

**→ See [START_HERE.md](./START_HERE.md) for the simplest startup guide!**

### Prerequisites
- ✅ Node.js 18+ (you have v22.17.1 ✓)
- ✅ npm 10+ (you have v10.9.2 ✓)
- ❌ PostgreSQL 15+ (needs installation)
- ⚠️ Redis (optional)
- ⚠️ Docker (optional)

### Option 1: Quick Start Script (Recommended)

```powershell
# 1. Install PostgreSQL from https://www.postgresql.org/download/windows/

# 2. Run setup script
.\quick-start.ps1

# 3. Start backend (Terminal 1)
cd backend
npm run dev

# 4. Start frontend (Terminal 2)
cd frontend
npm run dev

# 5. Open http://localhost:5173
```

### Option 2: Using Docker

```bash
# Install Docker Desktop first
docker-compose up
```

### Option 3: Manual Setup

See **[INSTALL_GUIDE.md](./INSTALL_GUIDE.md)** for step-by-step manual installation.

### 🔐 Test Login Credentials

**Admin:**
- Email: `admin@samarthdesk.com`
- Password: `Admin@123`

**Agent:**
- Email: `agent@samarthdesk.com`
- Password: `Agent@123`

**Customer:**
- Email: `customer@example.com`
- Password: `Customer@123`

## 📁 Project Structure

```
samarthdesk-ai/
├── frontend/              # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── hooks/        # Custom hooks
│   │   ├── store/        # Zustand store
│   │   └── lib/          # Utilities
│   └── package.json
├── backend/              # Express + TypeScript
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   ├── utils/        # Utilities
│   │   ├── validations/  # Zod schemas
│   │   └── prisma/       # Database seed
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
├── docs/                 # Documentation
├── .github/workflows/    # CI/CD
└── package.json          # Root workspace

**Stats:**
- 90+ files created
- 10,000+ lines of code
- 27 API endpoints
- 15+ UI pages
- 9 database tables
```

## 📊 What's Built

### API Endpoints: 27
- **Auth:** 9 endpoints (register, login, logout, refresh, forgot/reset password, verify email, change password)
- **Users:** 9 endpoints (profile, avatar, admin CRUD, status management)
- **Tickets:** 9 endpoints (CRUD, assign, stats, search/filter)

### Frontend Pages: 15+
- Authentication: Login, Register, Forgot Password
- User: Dashboard, Profile
- Tickets: List, Create, Detail
- Admin: Dashboard, Overview, User Management

### Database: 9 Tables
- User, Session, Ticket, TicketMessage, Attachment, Category, Notification, AuditLog, EmailLog

**For complete details:** See **[PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md)**

---

## 🎯 Current Status

**✅ Completed:** Phase 1-3 (Authentication, Users, Tickets)  
**🚧 Remaining:** Phase 4-18 (AI, Real-time, Email, Analytics, etc.)

**What Works Now:**
- Complete auth system with JWT
- User management & profiles
- Ticket creation & management
- Role-based access control
- Search & filtering
- Professional UI with Tailwind

**What's Coming:**
- AI features (summarization, smart replies)
- Real-time updates (WebSocket)
- Email integration
- Advanced analytics

See **[CURRENT_STATUS.md](./CURRENT_STATUS.md)** for detailed breakdown.

## 📚 Documentation

### 🚀 Getting Started (Read These First!)
- **[START_HERE.md](./START_HERE.md)** - 👈 **START HERE!** Simplest guide
- **[RUN_NOW.md](./RUN_NOW.md)** - Quick 3-step process to run
- **[INSTALL_GUIDE.md](./INSTALL_GUIDE.md)** - Detailed installation for Windows
- **[START.md](./START.md)** - Comprehensive startup guide
- **[CURRENT_STATUS.md](./CURRENT_STATUS.md)** - What's built vs what's not

### 📖 Project Information
- **[PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md)** - Complete feature overview
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Project summary
- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - All documentation
- **[ROADMAP.md](./ROADMAP.md)** - 18-phase development plan

### 🔧 Development Guides
- **[SETUP.md](./SETUP.md)** - Initial project setup
- **[QUICKSTART.md](./QUICKSTART.md)** - Quick reference
- **[TESTING.md](./TESTING.md)** - Testing strategies
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute
- **[GIT_COMMIT_GUIDE.md](./GIT_COMMIT_GUIDE.md)** - Git workflow
- **[CLAUDE.md](./CLAUDE.md)** - Claude Code workflow and repo guardrails

### 🚀 Deployment
- **[DEPLOYMENT_COMPLETE_GUIDE.md](./DEPLOYMENT_COMPLETE_GUIDE.md)** - Deploy to Railway/Docker/Vercel
- **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Railway deployment

### 📋 Phase Documentation
- **[PHASE1_COMPLETE.md](./PHASE1_COMPLETE.md)** - Authentication system
- **[PHASE1_SUMMARY.md](./PHASE1_SUMMARY.md)** - Phase 1 summary
- **[PHASE2_COMPLETE.md](./PHASE2_COMPLETE.md)** - User management
- **[NEXT_STEPS.md](./NEXT_STEPS.md)** - What's next

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Zod** - Validation
- **Winston** - Logging
- **Helmet** - Security
- **CORS** - Cross-origin support
- **express-rate-limit** - Rate limiting

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **GitHub Actions** - CI/CD
- **Prisma Migrate** - Database migrations

### Coming Soon
- **Vercel AI SDK** - AI integration
- **Socket.io** - Real-time updates
- **BullMQ + Redis** - Job queue
- **Nodemailer** - Email sending

---

## 🐛 Troubleshooting

### Can't connect to database?
```powershell
# Check PostgreSQL service
Get-Service -Name postgresql*

# Start if stopped
Start-Service -Name postgresql-x64-15
```

### Port already in use?
```powershell
# Kill process on port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

### Prisma errors?
```powershell
cd backend
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

**More help:** See [INSTALL_GUIDE.md](./INSTALL_GUIDE.md) troubleshooting section

---

## 📝 API Documentation

### Base URL
```
Development: http://localhost:5000/api/v1
```

### Authentication Endpoints
```
POST   /auth/register          - Register new user
POST   /auth/login             - Login user
POST   /auth/logout            - Logout user
POST   /auth/refresh-token     - Refresh access token
POST   /auth/forgot-password   - Request password reset
POST   /auth/reset-password    - Reset password
POST   /auth/verify-email      - Verify email
POST   /auth/change-password   - Change password
GET    /auth/me                - Get current user
```

### User Endpoints
```
GET    /users/profile          - Get user profile
PUT    /users/profile          - Update profile
POST   /users/profile/avatar   - Upload avatar
GET    /users/admin/users      - List users (Admin)
POST   /users/admin/users      - Create user (Admin)
GET    /users/admin/users/:id  - Get user (Admin)
PUT    /users/admin/users/:id  - Update user (Admin)
DELETE /users/admin/users/:id  - Delete user (Admin)
PATCH  /users/admin/users/:id/status - Toggle status (Admin)
```

### Ticket Endpoints
```
GET    /tickets                - List tickets (role-based)
POST   /tickets                - Create ticket
GET    /tickets/:id            - Get ticket details
PUT    /tickets/:id            - Update ticket
DELETE /tickets/:id            - Delete ticket (Admin)
PATCH  /tickets/:id/assign     - Assign ticket (Agent/Admin)
GET    /tickets/stats          - Get statistics
```

**For complete API docs with request/response examples:** See [PROJECT_COMPLETE.md](./PROJECT_COMPLETE.md)

---

## 🧪 Testing

```powershell
# Run all tests
npm test

# Run backend tests
cd backend
npm test

# Run with coverage
npm run test:coverage

# Open Prisma Studio (Database GUI)
cd backend
npx prisma studio
```

---

## 🚀 Deployment

### Railway (Recommended)
1. Push code to GitHub
2. Connect Railway to your repo
3. Add PostgreSQL service
4. Configure environment variables
5. Deploy!

**Detailed guide:** [DEPLOYMENT_COMPLETE_GUIDE.md](./DEPLOYMENT_COMPLETE_GUIDE.md)

**Checked-in Railway config:**
- `backend/railway.toml` runs Prisma migrations before boot
- `frontend/railway.toml` serves the built app with `vite preview` on Railway's assigned port
- Set `VITE_API_URL` and `VITE_WS_URL` in Railway because the frontend and backend run on different public domains

### Docker
```bash
copy .env.prod.example .env
docker compose -f docker-compose.prod.yml up --build -d
```

Docker production notes:
- `backend/Dockerfile` runs `npm run start:migrate` so Prisma migrations apply on container start
- `frontend` defaults to `/api/v1` and same-origin Socket.IO, matching the Nginx reverse proxy in `frontend/nginx.conf`
- Update `CORS_ORIGIN`, `APP_URL`, and `FRONTEND_URL` in the copied `.env` file to your real public frontend URL

### Manual VPS
- Node.js 18+
- PostgreSQL 15+
- Redis (optional)
- Nginx (reverse proxy)

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🎉 Ready to Start?

1. **Read:** [START_HERE.md](./START_HERE.md)
2. **Install:** PostgreSQL
3. **Run:** `.\quick-start.ps1`
4. **Enjoy!** 🚀


## 💬 Support

Need help?
- Check the documentation files above
- Review troubleshooting sections
- See [INSTALL_GUIDE.md](./INSTALL_GUIDE.md) for common issues

---

**Built with ❤️ using React, TypeScript, Node.js, and PostgreSQL**
