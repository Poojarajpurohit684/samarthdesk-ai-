# Railway Backend Deployment Guide

## Step 1: Create Railway Project
1. Go to https://railway.app
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select: Poojarajpurohit684/samarthdesk-ai-
5. Set root directory: `backend`

## Step 2: Add Databases
1. Click "+ New" → "Database" → "Add PostgreSQL"
2. Click "+ New" → "Database" → "Add Redis"

## Step 3: Environment Variables
Copy these into Railway's environment settings:

```bash
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Database (Railway will auto-populate)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (Railway will auto-populate) 
REDIS_URL=${{Redis.REDIS_URL}}

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-production-jwt-key-2024
JWT_REFRESH_SECRET=your-super-secret-production-refresh-key-2024
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS - Update after frontend deployment
CORS_ORIGIN=https://your-frontend-url.vercel.app

# OpenAI API (Add your key)
OPENAI_API_KEY=sk-your-openai-api-key-here
AI_MODEL=gpt-4-turbo-preview
AI_MAX_TOKENS=2000

# Email Configuration (Optional for demo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=Samarthdesk AI Demo <noreply@samarthdesk.com>

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Application URLs (Update after deployment)
APP_NAME=Samarthdesk AI Demo
APP_URL=https://your-frontend-url.vercel.app
FRONTEND_URL=https://your-frontend-url.vercel.app
```

## Step 4: Deploy!
Railway will automatically:
- Build your Node.js app
- Run Prisma migrations
- Start the server
- Provide you with a live backend URL

## Next Steps After Backend Deployment:
1. Get your Railway backend URL
2. Update Vercel environment variables:
   - VITE_API_URL=https://your-backend.railway.app/api/v1
   - VITE_WS_URL=https://your-backend.railway.app
3. Redeploy frontend on Vercel

Your live demo will be ready! 🚀