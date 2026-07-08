import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import prisma from './utils/prisma';
import { initQueues } from './services/queue.service';
import jwt from 'jsonwebtoken';

const httpServer = createServer(app);

// Socket.io setup
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.cors.origin
      ? config.cors.origin.split(',').map((o) => o.trim())
      : ['http://localhost:5173'],
    credentials: true,
  },
});

// Authenticate socket connections
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
  if (!token) {
    return next(new Error('Authentication required'));
  }
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId?: string; id?: string };
    (socket as any).userId = decoded.userId ?? decoded.id;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = (socket as any).userId as string;
  logger.info(`Client connected: ${socket.id} (user: ${userId})`);

  // Join user's private notification room
  if (userId) {
    socket.join(`user:${userId}`);
  }

  // Join ticket room for real-time message updates
  socket.on('join:ticket', (ticketId: string) => {
    socket.join(`ticket:${ticketId}`);
    logger.debug(`Socket ${socket.id} joined ticket room: ${ticketId}`);
  });

  socket.on('leave:ticket', (ticketId: string) => {
    socket.leave(`ticket:${ticketId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Helper to emit to a specific user's room
export const emitToUser = (userId: string, event: string, data: unknown) => {
  io.to(`user:${userId}`).emit(event, data);
};

// Helper to emit to a ticket room
export const emitToTicket = (ticketId: string, event: string, data: unknown) => {
  io.to(`ticket:${ticketId}`).emit(event, data);
};

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Received shutdown signal, closing gracefully...');

  httpServer.close(() => {
    logger.info('HTTP server closed');
  });

  await prisma.$disconnect();
  logger.info('Database connection closed');

  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    httpServer.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.env} mode`);
      logger.info(`API available at http://localhost:${config.port}/api/${config.apiVersion}`);
      // Initialise BullMQ queues after server is up (non-blocking — Redis optional)
      initQueues().catch((err) => logger.warn('Queue init error:', err));
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
