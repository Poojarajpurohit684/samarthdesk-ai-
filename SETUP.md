# Samarthdesk AI - Setup Guide

## Overview

This guide will help you set up the Samarthdesk AI Customer Support Ticketing System on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** (v14 or higher)
- **Redis** (v7 or higher)
- **Docker & Docker Compose** (optional, for containerized setup)

## Quick Start with Docker

The easiest way to get started is using Docker:

```bash
# Clone the repository
git clone <repository-url>
cd samarthdesk-ai

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services
docker-compose up
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Database: localhost:5432

## Manual Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspaces
```

### 2. Setup PostgreSQL Database

Create a PostgreSQL database:

```bash
createdb samarthdesk_ai
```

Or using psql:

```sql
CREATE DATABASE samarthdesk_ai;
```

### 3. Setup Redis

Start Redis server:

```bash
# On macOS with Homebrew
brew services start redis

# On Ubuntu/Debian
sudo systemctl start redis

# Using Docker
docker run -d -p 6379:6379 redis:7-alpine
```

### 4. Configure Environment Variables

#### Backend (.env)

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and update:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/samarthdesk_ai
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secure-random-secret-key
JWT_REFRESH_SECRET=your-secure-refresh-secret-key
OPENAI_API_KEY=sk-your-openai-api-key
```

#### Frontend (.env)

```bash
cd frontend
cp .env.example .env
```

The default values should work for local development.

### 5. Setup Database Schema

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database with initial data
npm run db:seed
```

### 6. Start Development Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Default User Accounts

After seeding the database, you'll have these accounts:

### Admin Account
- Email: `admin@samarthdesk.com`
- Password: `Admin@123`
- Role: ADMIN

### Support Agent Account
- Email: `agent@samarthdesk.com`
- Password: `Agent@123`
- Role: AGENT

### Customer Account
- Email: `customer@example.com`
- Password: `Customer@123`
- Role: CUSTOMER

## Testing the Installation

1. Open http://localhost:5173
2. Click "Login"
3. Use any of the default accounts above
4. You should be redirected to the appropriate dashboard

## Development Workflow

### Running Tests

```bash
# Run all tests
npm run test

# Run backend tests only
cd backend && npm run test

# Run frontend tests only
cd frontend && npm run test
```

### Linting

```bash
# Lint all workspaces
npm run lint

# Lint backend
cd backend && npm run lint

# Lint frontend
cd frontend && npm run lint
```

### Database Management

```bash
cd backend

# Open Prisma Studio (GUI for database)
npm run db:studio

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Building for Production

```bash
# Build all workspaces
npm run build

# Build individually
cd backend && npm run build
cd frontend && npm run build
```

## Project Structure

```
samarthdesk-ai/
├── backend/                 # Node.js/Express backend
│   ├── prisma/             # Database schema and migrations
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes (to be added)
│   │   ├── controllers/    # Route controllers (to be added)
│   │   ├── services/       # Business logic (to be added)
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript types
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   └── package.json
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components (to be added)
│   │   ├── pages/          # Page components (to be added)
│   │   ├── hooks/          # Custom hooks (to be added)
│   │   ├── services/       # API services (to be added)
│   │   ├── store/          # State management (to be added)
│   │   ├── utils/          # Utility functions (to be added)
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   └── package.json
│
├── docker-compose.yml      # Docker development setup
├── docker-compose.prod.yml # Docker production setup
└── package.json            # Root package.json
```

## Troubleshooting

### Port Already in Use

If ports 5000 or 5173 are already in use:

```bash
# Find and kill the process
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Verify DATABASE_URL in .env
3. Check if database exists:
   ```bash
   psql -l
   ```

### Redis Connection Issues

1. Ensure Redis is running:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

### Prisma Issues

```bash
# Regenerate Prisma Client
cd backend
npx prisma generate

# Reset Prisma
npx prisma migrate reset
npx prisma generate
npm run db:seed
```

## Next Steps

Now that your development environment is set up, we'll build features incrementally:

1. **Phase 1**: Authentication System (JWT, Login, Register, Password Reset)
2. **Phase 2**: User Management (Profile, RBAC)
3. **Phase 3**: Ticket System (CRUD, Status, Priority)
4. **Phase 4**: AI Features (Summarization, Reply Generation, Classification)
5. **Phase 5**: Real-time Features (WebSocket, Notifications)
6. **Phase 6**: Email System (Send/Receive)
7. **Phase 7**: Admin Dashboard (Analytics, Management)
8. **Phase 8**: Testing & Deployment

## Support

For issues or questions:
- Check the documentation
- Review the troubleshooting section
- Check GitHub issues

## License

MIT
