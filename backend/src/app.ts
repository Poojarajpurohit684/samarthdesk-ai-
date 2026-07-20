import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

const app = express();

const allowedOrigins = [
  'https://frontend-km6jkzu6c-poojarajpurohit684s-projects.vercel.app',
  'https://samarthdesk-al-new-tawny.vercel.app',
  'https://samarthdesk-ai-poojarajpurohit684s-projects.vercel.app',
  'https://samarthdesk-ai-git-main-poojarajpurohit684s-projects.vercel.app', 
  'https://samarthdesk-3hdo8dja4-poojarajpurohit684s-projects.vercel.app',
  'https://samarthdesk-ai.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isAllowedOrigin =
        allowedOrigins.includes(origin) ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

      if (isAllowedOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`), false);
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(`/api/${config.apiVersion}`, apiLimiter);

// Health check
import prismaHealth from './utils/prisma';
app.get('/health', async (_req, res) => {
  let dbStatus = 'connected';
  try {
    await prismaHealth.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'unavailable';
  }
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// API Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import ticketRoutes from './routes/ticket.routes';
import messageRoutes from './routes/message.routes';

app.use(`/api/${config.apiVersion}/auth`, authRoutes);
app.use(`/api/${config.apiVersion}/users`, userRoutes);
app.use(`/api/${config.apiVersion}/tickets`, ticketRoutes);
app.use(`/api/${config.apiVersion}/tickets/:id/messages`, messageRoutes);

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

export default app;
