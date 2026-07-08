# Quick Start Guide - Samarthdesk AI

Get up and running in 5 minutes!

## 🚀 Fastest Way - Using Docker

```bash
# 1. Clone the repository
git clone <repository-url>
cd samarthdesk-ai

# 2. Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start everything with Docker
docker-compose up
```

**That's it!** 🎉

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Database: localhost:5432

## 🔐 Login Credentials

After Docker starts, use these accounts:

**Admin:**
- Email: `admin@samarthdesk.com`
- Password: `Admin@123`

**Support Agent:**
- Email: `agent@samarthdesk.com`
- Password: `Agent@123`

**Customer:**
- Email: `customer@example.com`
- Password: `Customer@123`

## 📋 Without Docker

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Edit backend/.env with your database URL
# DATABASE_URL=postgresql://username:password@localhost:5432/samarthdesk_ai

# 4. Setup database
cd backend
npx prisma migrate dev
npx prisma generate
npm run db:seed

# 5. Start servers (in separate terminals)
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## ⚙️ Required Services

If not using Docker, you need:

1. **PostgreSQL** (port 5432)
2. **Redis** (port 6379)

### Install PostgreSQL:
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu
sudo apt install postgresql
sudo systemctl start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### Install Redis:
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt install redis-server
sudo systemctl start redis

# Windows
# Download from https://github.com/microsoftarchive/redis/releases
```

## 🛠️ Important Environment Variables

### Backend (.env)

**Required for AI features:**
```env
OPENAI_API_KEY=sk-your-openai-api-key
```

**Required for email features:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Must change in production:**
```env
JWT_SECRET=your-unique-secret-key-here
JWT_REFRESH_SECRET=your-unique-refresh-key-here
```

## 🧪 Verify Installation

```bash
# Check backend
curl http://localhost:5000/health

# Should return:
# {"success":true,"message":"Server is running","timestamp":"..."}
```

## 📚 Next Steps

1. ✅ Login with a test account
2. ✅ Explore the dashboard (coming soon)
3. ✅ Create a test ticket (coming soon)
4. ✅ Try AI features (coming soon)

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill processes on ports
lsof -ti:5000 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
```

### Database connection error
```bash
# Check PostgreSQL is running
psql -l

# Create database if missing
createdb samarthdesk_ai
```

### Redis connection error
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG
```

### Prisma issues
```bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

## 📖 Documentation

- [Full Setup Guide](./SETUP.md) - Detailed instructions
- [Development Roadmap](./ROADMAP.md) - Feature phases
- [Project Summary](./PROJECT_SUMMARY.md) - What's built
- [Contributing](./CONTRIBUTING.md) - How to contribute

## 💬 Need Help?

- Check [SETUP.md](./SETUP.md) for detailed instructions
- Review [Troubleshooting section](#troubleshooting)
- Check GitHub Issues
- Review logs in Docker: `docker-compose logs -f`

## 🎯 Available Scripts

```bash
# Development
npm run dev              # Start all services
npm run build            # Build all workspaces
npm run test             # Run all tests
npm run lint             # Lint code

# Docker
docker-compose up        # Start with Docker
docker-compose down      # Stop all services
docker-compose logs -f   # View logs

# Database
cd backend
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed with test data
```

## ✨ Features Available

### ✅ Currently Available:
- Project structure
- Database schema
- Docker setup
- Authentication framework
- API foundation
- Frontend foundation

### 🔄 In Development:
- User authentication (login/register)
- Ticket management
- AI features
- Real-time updates
- Email integration
- Admin dashboard

See [ROADMAP.md](./ROADMAP.md) for complete feature timeline.

---

**Happy Coding! 🚀**
