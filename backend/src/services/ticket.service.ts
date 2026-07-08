import prisma from '../utils/prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { TicketStatus, TicketPriority, TicketCategory, Prisma } from '@prisma/client';
import { enqueueAiClassify } from './queue.service';
import { logger } from '../utils/logger';

interface CreateTicketData {
  title: string;
  description: string;
  category?: TicketCategory;
  priority?: TicketPriority;
}

interface UpdateTicketData {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  tags?: string[];
  assignedToId?: string;
}

interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assignedToId?: string;
  createdById?: string;
  search?: string;
}

export class TicketService {
  private generateTicketNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TKT-${timestamp}-${random}`;
  }

  async createTicket(data: CreateTicketData, userId: string) {
    const ticketNumber = this.generateTicketNumber();

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        title: data.title,
        description: data.description,
        category: data.category || TicketCategory.OTHER,
        priority: data.priority || TicketPriority.MEDIUM,
        status: TicketStatus.OPEN,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Create notification for admins/agents
    const adminsAndAgents = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'AGENT'] },
        isActive: true,
      },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: adminsAndAgents.map((user) => ({
        userId: user.id,
        ticketId: ticket.id,
        type: 'TICKET_CREATED',
        title: 'New Ticket Created',
        message: `New ticket #${ticket.ticketNumber}: ${ticket.title}`,
      })),
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CREATE_TICKET',
        entity: 'Ticket',
        entityId: ticket.id,
        changes: {
          ticketNumber: ticket.ticketNumber,
          title: ticket.title,
        },
      },
    });

    // Enqueue AI classification (fire-and-forget)
    enqueueAiClassify(ticket.id, ticket.title, ticket.description).catch((err) =>
      logger.warn('Failed to enqueue AI classify job:', err)
    );

    return ticket;
  }

  async getTickets(
    page: number = 1,
    limit: number = 10,
    filters: TicketFilters = {},
    userId: string,
    userRole: string
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.TicketWhereInput = {};

    // Role-based filtering
    if (userRole === 'CUSTOMER') {
      where.createdById = userId;
    } else if (userRole === 'AGENT') {
      where.OR = [{ assignedToId: userId }, { assignedToId: null }];
    }
    // ADMIN sees all tickets

    // Apply filters
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.category) where.category = filters.category;
    if (filters.assignedToId) where.assignedToId = filters.assignedToId;
    if (filters.createdById) where.createdById = filters.createdById;

    if (filters.search) {
      const searchConditions: Prisma.TicketWhereInput['OR'] = [
        { ticketNumber: { contains: filters.search, mode: 'insensitive' } },
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
      if (where.OR) {
        // Combine existing role-based OR with search using AND
        where.AND = [{ OR: where.OR }, { OR: searchConditions }];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          _count: {
            select: {
              messages: true,
              attachments: true,
            },
          },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    return {
      tickets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTicketById(ticketId: string, userId: string, userRole: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                avatar: true,
              },
            },
            attachments: true,
          },
        },
        attachments: true,
      },
    });

    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }

    // Check access permissions
    if (userRole === 'CUSTOMER' && ticket.createdById !== userId) {
      throw new ForbiddenError('You do not have access to this ticket');
    }

    // Agents can view any unassigned ticket OR tickets assigned to them
    if (userRole === 'AGENT' && ticket.assignedToId !== null && ticket.assignedToId !== userId) {
      throw new ForbiddenError('This ticket is assigned to another agent');
    }

    return ticket;
  }

  async updateTicket(
    ticketId: string,
    data: UpdateTicketData,
    userId: string,
    userRole: string
  ) {
    const ticket = await this.getTicketById(ticketId, userId, userRole);

    // Customers can only update their own tickets and only title/description
    if (userRole === 'CUSTOMER') {
      if (ticket.createdById !== userId) {
        throw new ForbiddenError('You can only update your own tickets');
      }
      // Limit what customers can update
      data = {
        title: data.title,
        description: data.description,
      };
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        category: data.category,
        tags: data.tags,
        assignedToId: data.assignedToId,
        resolvedAt: data.status === TicketStatus.RESOLVED ? new Date() : undefined,
        closedAt: data.status === TicketStatus.CLOSED ? new Date() : undefined,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Create notification for ticket creator if status changed
    if (data.status && data.status !== ticket.status) {
      await prisma.notification.create({
        data: {
          userId: ticket.createdById,
          ticketId: ticket.id,
          type: 'TICKET_UPDATED',
          title: 'Ticket Status Updated',
          message: `Ticket #${ticket.ticketNumber} status changed to ${data.status}`,
        },
      });
    }

    // Create notification if ticket assigned
    if (data.assignedToId && data.assignedToId !== ticket.assignedToId) {
      await prisma.notification.create({
        data: {
          userId: data.assignedToId,
          ticketId: ticket.id,
          type: 'TICKET_ASSIGNED',
          title: 'New Ticket Assigned',
          message: `Ticket #${ticket.ticketNumber} has been assigned to you`,
        },
      });
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_TICKET',
        entity: 'Ticket',
        entityId: ticketId,
        changes: data as Prisma.InputJsonValue,
      },
    });

    return updatedTicket;
  }

  async deleteTicket(ticketId: string, userId: string, userRole: string) {
    const ticket = await this.getTicketById(ticketId, userId, userRole);

    // Only admins can delete tickets
    if (userRole !== 'ADMIN') {
      throw new ForbiddenError('Only admins can delete tickets');
    }

    await prisma.ticket.delete({
      where: { id: ticketId },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE_TICKET',
        entity: 'Ticket',
        entityId: ticketId,
        changes: { ticketNumber: ticket.ticketNumber },
      },
    });
  }

  async assignTicket(ticketId: string, agentId: string, assignerId: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundError('Ticket not found');
    }

    const agent = await prisma.user.findUnique({
      where: { id: agentId },
    });

    if (!agent || (agent.role !== 'AGENT' && agent.role !== 'ADMIN')) {
      throw new ForbiddenError('Can only assign tickets to agents or admins');
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assignedToId: agentId,
        status: TicketStatus.IN_PROGRESS,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    // Notify the agent
    await prisma.notification.create({
      data: {
        userId: agentId,
        ticketId: ticket.id,
        type: 'TICKET_ASSIGNED',
        title: 'New Ticket Assigned',
        message: `Ticket #${ticket.ticketNumber} has been assigned to you`,
      },
    });

    // Notify the customer
    await prisma.notification.create({
      data: {
        userId: ticket.createdById,
        ticketId: ticket.id,
        type: 'TICKET_UPDATED',
        title: 'Ticket Assigned',
        message: `Your ticket #${ticket.ticketNumber} has been assigned to ${agent.firstName} ${agent.lastName}`,
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: assignerId,
        action: 'ASSIGN_TICKET',
        entity: 'Ticket',
        entityId: ticketId,
        changes: { assignedToId: agentId },
      },
    });

    return updatedTicket;
  }

  async getTicketStats(userId?: string, userRole?: string) {
    const where: Prisma.TicketWhereInput = {};

    if (userRole === 'CUSTOMER' && userId) {
      where.createdById = userId;
    } else if (userRole === 'AGENT' && userId) {
      where.assignedToId = userId;
    }

    const [
      total,
      open,
      pending,
      inProgress,
      resolved,
      closed,
      byPriority,
      byCategory,
    ] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.count({ where: { ...where, status: TicketStatus.OPEN } }),
      prisma.ticket.count({ where: { ...where, status: TicketStatus.PENDING } }),
      prisma.ticket.count({ where: { ...where, status: TicketStatus.IN_PROGRESS } }),
      prisma.ticket.count({ where: { ...where, status: TicketStatus.RESOLVED } }),
      prisma.ticket.count({ where: { ...where, status: TicketStatus.CLOSED } }),
      prisma.ticket.groupBy({
        by: ['priority'],
        where,
        _count: true,
      }),
      prisma.ticket.groupBy({
        by: ['category'],
        where,
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: {
        open,
        pending,
        inProgress,
        resolved,
        closed,
      },
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export const ticketService = new TicketService();
