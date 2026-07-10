# Claude Code Workflow

## Project Overview

- Monorepo with `frontend` and `backend` applications.
- `frontend` is a React + TypeScript + Vite app.
- `backend` is an Express + TypeScript API with Prisma, PostgreSQL, Redis, and Socket.IO.
- Production deployment targets include Docker Compose and Railway.

## Development Commands

### Root

```powershell
npm run docker:dev
npm run docker:prod
```

### Backend

```powershell
cd backend
npm ci
npm run dev
npm run build
npm run lint
npm run test -- --run
npx prisma generate
npx prisma migrate deploy
```

### Frontend

```powershell
cd frontend
npm ci
npm run dev
npm run build
npm run lint
```

## Working Agreements

- Prefer focused changes over broad rewrites.
- Keep Docker, Railway, and local workflows aligned when changing ports, env vars, or startup commands.
- Preserve the `/health` endpoint for production health checks.
- When changing API URLs or sockets, update both `VITE_API_URL` and `VITE_WS_URL` guidance.
- Keep the Docker frontend compatible with the checked-in Nginx reverse proxy defaults of `/api/v1` and `/socket.io`.
- Validate production-sensitive changes with a local build before handoff when possible.

## Architecture Notes

- Backend entrypoint: `backend/src/server.ts`
- Backend app setup and health endpoint: `backend/src/app.ts`
- Backend env parsing: `backend/src/config/index.ts`
- Frontend API client: `frontend/src/lib/axios.ts`
- Frontend socket client: `frontend/src/lib/socket.ts`
- Railway service config: `backend/railway.toml`, `frontend/railway.toml`
- Docker production orchestration: `docker-compose.prod.yml`

## Production Expectations

- Backend Railway deploy must run Prisma migrations before startup.
- Frontend Railway deploy must use a runtime that exists in the build environment.
- Backend Docker image must be able to run `npm run start:migrate` without installing extra packages at runtime.
- Frontend Docker image should work with reverse-proxied relative paths by default and still allow Railway-specific `VITE_*` overrides.
- Docker production should build immutable images and expose `backend:5000` and `frontend:80`.
- `CORS_ORIGIN`, `APP_URL`, and `FRONTEND_URL` must match the deployed frontend domain.
- `DATABASE_URL`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` are required in production.
- Use `.env.prod.example` as the source of truth for Docker Compose production variables.

## Definition Of Done

- Build passes for the changed app.
- Lint passes for the changed app when the touched files are covered by the lint config.
- Docs are updated if developer workflow or deployment behavior changes.
- New production behavior is documented with exact env vars or commands.
