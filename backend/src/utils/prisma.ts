import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const isDev = process.env.NODE_ENV !== 'production';

const prisma = new PrismaClient({
  log: isDev
    ? ['error', 'warn']
    : ['error'],
});

// Expose a simple debug helper in dev via middleware instead of $on('query')
// which requires the `tracing` preview feature in schema.prisma
if (isDev) {
  logger.debug('Prisma client initialised in development mode');
}

export default prisma;
