import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ticketService } from '../ticket.service';
import prisma from '../../utils/prisma';
import { NotFoundError, ForbiddenError } from '../../utils/errors';

vi.mock('../../utils/prisma', () => ({
  default: {
    ticket: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    notification: {
      createMany: vi.fn(),
      create: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

// suppress queue side-effects
vi.mock('../queue.service', () => ({
  enqueueAiClassify: vi.fn().mockResolvedValue(undefined),
}));

const mockTicket = {
  id: 'ticket-1',
  ticketNumber: 'TKT-ABC-123',
  title: 'Test Ticket',
  description: 'This is a test ticket description',
  status: 'OPEN' as const,
  priority: 'MEDIUM' as const,
  category: 'OTHER' as const,
  tags: [],
  aiSummary: null,
  isAutoResolved: false,
  createdById: 'user-1',
  assignedToId: null,
  resolvedAt: null,
  closedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: { id: 'user-1', email: 'test@example.com', firstName: 'John', lastName: 'Doe', role: 'CUSTOMER' },
  assignedTo: null,
};

describe('TicketService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createTicket', () => {
    it('should create a ticket with correct data', async () => {
      vi.mocked(prisma.ticket.create).mockResolvedValue(mockTicket as any);
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);
      vi.mocked(prisma.notification.createMany).mockResolvedValue({ count: 0 });
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      const result = await ticketService.createTicket(
        { title: 'Test Ticket', description: 'This is a test ticket description' },
        'user-1'
      );

      expect(result).toBeDefined();
      expect(prisma.ticket.create).toHaveBeenCalledOnce();
    });
  });

  describe('getTicketById', () => {
    it('should return a ticket when found and user is owner', async () => {
      vi.mocked(prisma.ticket.findUnique).mockResolvedValue(mockTicket as any);

      const result = await ticketService.getTicketById('ticket-1', 'user-1', 'CUSTOMER');

      expect(result).toBeDefined();
      expect(result.id).toBe('ticket-1');
    });

    it('should throw NotFoundError when ticket does not exist', async () => {
      vi.mocked(prisma.ticket.findUnique).mockResolvedValue(null);

      await expect(
        ticketService.getTicketById('nonexistent', 'user-1', 'CUSTOMER')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ForbiddenError when customer accesses another users ticket', async () => {
      vi.mocked(prisma.ticket.findUnique).mockResolvedValue(mockTicket as any);

      await expect(
        ticketService.getTicketById('ticket-1', 'other-user', 'CUSTOMER')
      ).rejects.toThrow(ForbiddenError);
    });

    it('should allow ADMIN to access any ticket', async () => {
      vi.mocked(prisma.ticket.findUnique).mockResolvedValue(mockTicket as any);

      const result = await ticketService.getTicketById('ticket-1', 'admin-user', 'ADMIN');
      expect(result).toBeDefined();
    });
  });

  describe('deleteTicket', () => {
    it('should throw ForbiddenError when non-admin tries to delete', async () => {
      vi.mocked(prisma.ticket.findUnique).mockResolvedValue(mockTicket as any);

      await expect(
        ticketService.deleteTicket('ticket-1', 'user-1', 'CUSTOMER')
      ).rejects.toThrow(ForbiddenError);
    });

    it('should delete ticket when admin deletes', async () => {
      vi.mocked(prisma.ticket.findUnique).mockResolvedValue(mockTicket as any);
      vi.mocked(prisma.ticket.delete).mockResolvedValue(mockTicket as any);
      vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);

      await expect(
        ticketService.deleteTicket('ticket-1', 'admin-1', 'ADMIN')
      ).resolves.not.toThrow();
    });
  });

  describe('getTicketStats', () => {
    it('should return stats with correct shape', async () => {
      vi.mocked(prisma.ticket.count).mockResolvedValue(10);
      vi.mocked(prisma.ticket.groupBy).mockResolvedValue([] as any);

      const stats = await ticketService.getTicketStats(undefined, 'ADMIN');

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byStatus');
      expect(stats).toHaveProperty('byPriority');
      expect(stats).toHaveProperty('byCategory');
      expect(stats.byStatus).toHaveProperty('open');
      expect(stats.byStatus).toHaveProperty('resolved');
    });
  });
});
