import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';
import { emailService } from './email.service';
import { aiService } from './ai.service';
import prisma from '../utils/prisma';

// ─── Queue handles (null when Redis is unavailable) ───────────────────────
export let emailQueue:     Queue | null = null;
export let aiQueue:        Queue | null = null;
export let reminderQueue:  Queue | null = null;
export let autoCloseQueue: Queue | null = null;

// ─── Job interfaces ───────────────────────────────────────────────────────
interface EmailJob {
  type: 'verification' | 'reset' | 'welcome' | 'reply-notification';
  to: string;
  token?: string;
  firstName?: string;
  ticketNumber?: string;
  agentName?: string;
}

interface AiJob {
  type: 'classify' | 'summarise';
  ticketId: string;
  title: string;
  description: string;
  messages?: string[];
}

export interface AutoCloseJob {
  ticketId: string;
  ticketNumber: string;
  createdById: string;
  messages: string[];
  lastActivityDaysAgo: number;
}

// ─── Initialise queues + workers ──────────────────────────────────────────
// Probes Redis first; skips BullMQ entirely if unavailable so the server
// can start without Redis in local/dev environments.
export async function initQueues(): Promise<void> {
  const probe = new IORedis(config.redis.url, {
    maxRetriesPerRequest: 1,
    connectTimeout: 3000,
    lazyConnect: true,
  });
  // Prevent unhandled error events from the probe instance
  probe.on('error', () => void 0);

  try {
    await probe.connect();
    await probe.ping();
    await probe.quit();
  } catch {
    await probe.disconnect();
    logger.warn('Redis unavailable — BullMQ queues disabled. Background jobs will not run.');
    return;
  }

  // Redis is reachable — safe to create queues and workers
  const connection = { url: config.redis.url };

  emailQueue     = new Queue('email',      { connection });
  aiQueue        = new Queue('ai',         { connection });
  reminderQueue  = new Queue('reminders',  { connection });
  autoCloseQueue = new Queue('auto-close', { connection });

  const emailWorker = new Worker<EmailJob>(
    'email',
    async (job) => {
      const { type, to, token, firstName, ticketNumber, agentName } = job.data;
      switch (type) {
        case 'verification': await emailService.sendVerificationEmail(to, token!); break;
        case 'reset':        await emailService.sendPasswordResetEmail(to, token!); break;
        case 'welcome':      await emailService.sendWelcomeEmail(to, firstName!); break;
        case 'reply-notification':
          await emailService.sendTicketReplyNotification(to, ticketNumber!, agentName!);
          break;
      }
    },
    { connection }
  );

  const aiWorker = new Worker<AiJob>(
    'ai',
    async (job) => {
      const { type, ticketId, title, description, messages = [] } = job.data;
      if (type === 'classify') {
        const result = await aiService.classifyTicket(ticketId, title, description);
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { category: result.category, priority: result.priority },
        });
      } else if (type === 'summarise') {
        await aiService.summariseTicket(ticketId, title, description, messages);
      }
    },
    { connection }
  );

  const autoCloseWorker = new Worker<AutoCloseJob>(
    'auto-close',
    async (job) => {
      const { ticketId, ticketNumber, createdById, messages, lastActivityDaysAgo } = job.data;
      const shouldClose = await aiService.suggestAutoClose(ticketId, messages, lastActivityDaysAgo);
      if (shouldClose) {
        await prisma.ticket.update({
          where: { id: ticketId },
          data: { status: 'CLOSED', closedAt: new Date(), isAutoResolved: true },
        });
        await prisma.notification.create({
          data: {
            userId: createdById,
            ticketId,
            type: 'TICKET_CLOSED',
            title: 'Ticket Auto-Closed',
            message: `Ticket #${ticketNumber} was automatically closed due to inactivity.`,
          },
        });
      }
    },
    { connection }
  );

  // Reminder worker — reserved for future scheduled reminders
  const reminderWorker = new Worker(
    'reminders',
    async (job) => {
      logger.debug(`Reminder job processed: ${job.id}`);
    },
    { connection }
  );

  [emailWorker, aiWorker, autoCloseWorker, reminderWorker].forEach((w) => {
    w.on('failed', (job, err) =>
      logger.error(`Queue job failed [${w.name}]`, { error: String(err), jobId: job?.id })
    );
    w.on('error', (err) =>
      logger.warn(`Worker connection error [${w.name}]`, String(err))
    );
  });

  logger.info('BullMQ queues and workers initialised');
}

// ─── Null-safe enqueue helpers ────────────────────────────────────────────
export const enqueueAiClassify = async (ticketId: string, title: string, description: string) => {
  if (!aiQueue) return;
  return aiQueue.add(
    'classify',
    { type: 'classify' as const, ticketId, title, description },
    { attempts: 2, backoff: { type: 'exponential', delay: 5000 } }
  );
};

export const enqueueAiSummarise = async (
  ticketId: string,
  title: string,
  description: string,
  messages: string[]
) => {
  if (!aiQueue) return;
  return aiQueue.add(
    'summarise',
    { type: 'summarise' as const, ticketId, title, description, messages },
    { attempts: 2 }
  );
};

export const enqueueAutoClose = async (job: AutoCloseJob) => {
  if (!autoCloseQueue) return;
  return autoCloseQueue.add('auto-close', job, { attempts: 1 });
};
