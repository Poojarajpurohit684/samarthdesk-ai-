# Deployment Guide - Railway

This guide covers deploying Samarthdesk AI to Railway.

## Prerequisites

- Railway account ([Sign up here](https://railway.app))
- GitHub account
- Railway CLI (optional)

## Deployment Steps

### 1. Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "feat: complete project setup"
git push origin main
```

### 2. Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select your repository

### 3. Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database"
3. Choose "PostgreSQL"
4. Railway will automatically create the database
5. Note the connection details

### 4. Add Redis

1. Click "New" again
2. Select "Database"
3. Choose "Redis"
4. Railway will provision Redis instance

### 5. Deploy Backend

1. Click "New" → "GitHub Repo"
2. Select your repository
3. Configure the service:

**Root Directory:** `backend`

**Build Command:**
```bash
npm install && npx prisma generate && npm run build
```

**Start Command:**
```bash
npx prisma migrate deploy && npm start
```

**Environment Variables:**

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=<generate-secure-random-string>
JWT_REFRESH_SECRET=<generate-secure-random-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=<your-frontend-url>
OPENAI_API_KEY=<your-openai-key>
AI_MODEL=gpt-4-turbo-preview
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASSWORD=<your-app-password>
SMTP_FROM=Samarthdesk AI <noreply@samarthdesk.com>
APP_URL=<your-frontend-url>
FRONTEND_URL=<your-frontend-url>
```

### 6. Deploy Frontend

1. Click "New" → "GitHub Repo"
2. Select your repository again
3. Configure the service:

**Root Directory:** `frontend`

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm run preview
```

Or use Nginx (recommended):

**Dockerfile:**
Already configured in `frontend/Dockerfile`

**Environment Variables:**

```env
VITE_API_URL=<your-backend-url>/api/v1
VITE_WS_URL=<your-backend-url>
VITE_APP_NAME=Samarthdesk AI
```

### 7. Connect Services

Railway will automatically link services if you reference them using:
```
${{ServiceName.VARIABLE}}
```

### 8. Generate Secure Secrets

```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Use these for:
- JWT_SECRET
- JWT_REFRESH_SECRET

### 9. Setup Custom Domain (Optional)

1. Go to your frontend service
2. Click "Settings"
3. Scroll to "Domains"
4. Click "Generate Domain" or add custom domain
5. Update CORS_ORIGIN in backend with your domain

## Using Railway CLI

### Install CLI

```bash
npm install -g @railway/cli
```

### Login

```bash
railway login
```

### Deploy Backend

```bash
cd backend
railway up
```

### Deploy Frontend

```bash
cd frontend
railway up
```

### Set Environment Variables

```bash
railway variables set JWT_SECRET=your-secret
```

## Post-Deployment

### 1. Run Database Migrations

Railway automatically runs migrations during deployment if configured in start command.

Or manually:

```bash
railway run npx prisma migrate deploy
```

### 2. Seed Database

```bash
railway run npm run db:seed
```

### 3. Verify Deployment

```bash
# Check backend health
curl https://your-backend-url.railway.app/health

# Should return:
# {"success":true,"message":"Server is running","timestamp":"..."}
```

### 4. Test Login

1. Visit your frontend URL
2. Login with default admin account:
   - Email: admin@samarthdesk.com
   - Password: Admin@123

## Monitoring

### View Logs

**In Dashboard:**
1. Select your service
2. Click "Logs" tab

**Using CLI:**
```bash
railway logs
```

### Metrics

Railway provides automatic metrics:
- CPU usage
- Memory usage
- Network traffic
- Request count

Access via the "Metrics" tab in your service.

## Troubleshooting

### Database Connection Issues

Check DATABASE_URL format:
```
postgresql://username:password@host:port/database
```

### Build Failures

```bash
# View build logs
railway logs --build

# Common issues:
# - Missing dependencies: Check package.json
# - Prisma generation failed: Ensure schema is correct
# - TypeScript errors: Run `npm run build` locally first
```

### Runtime Errors

```bash
# View runtime logs
railway logs

# Common issues:
# - Missing environment variables
# - Database not migrated
# - Redis connection failed
```

### Environment Variables Not Loading

Ensure variables are set in Railway dashboard:
1. Select service
2. Go to "Variables" tab
3. Add/update variables
4. Redeploy

## Scaling

### Vertical Scaling

Railway automatically scales based on your plan.

### Horizontal Scaling

1. Go to service settings
2. Enable "Horizontal Scaling" (Pro plan)
3. Set replicas count

## Backup Strategy

### Database Backups

Railway provides automatic backups for PostgreSQL.

**Manual Backup:**
```bash
# Export database
railway run pg_dump > backup.sql

# Restore
railway run psql < backup.sql
```

### File Backups

For uploaded files, use cloud storage:
- AWS S3
- Google Cloud Storage
- Cloudinary

## Security Checklist

- [ ] Secure JWT secrets set
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Environment variables not exposed
- [ ] HTTPS enabled (automatic on Railway)
- [ ] Database credentials secured
- [ ] Email credentials secured
- [ ] API keys secured

## Cost Optimization

1. **Use starter plan** for development
2. **Upgrade to Pro** for production
3. **Monitor usage** in dashboard
4. **Optimize queries** to reduce database load
5. **Use Redis caching** to reduce API calls
6. **Implement pagination** to reduce data transfer

## Alternative Deployment Platforms

### Vercel (Frontend) + Railway (Backend)

**Benefits:**
- Better frontend performance
- Edge network
- Automatic previews

**Steps:**
1. Deploy backend to Railway
2. Deploy frontend to Vercel
3. Set VITE_API_URL to Railway backend URL

### AWS

Use AWS ECS, RDS, and ElastiCache for enterprise deployments.

### DigitalOcean

Use App Platform for simplified deployment.

### Heroku

Similar to Railway, with add-ons ecosystem.

## Support

- [Railway Documentation](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app/)

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Seed data loaded
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Error tracking setup (Sentry)
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Email service tested
- [ ] AI features tested
- [ ] Performance tested
- [ ] Security audit completed

---

**Ready to deploy! 🚀**
