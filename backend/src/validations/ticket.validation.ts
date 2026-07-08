import { z } from 'zod';
import { TicketStatus, TicketPriority, TicketCategory } from '@prisma/client';

export const createTicketSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    category: z.nativeEnum(TicketCategory).optional(),
    priority: z.nativeEnum(TicketPriority).optional(),
  }),
});

export const updateTicketSchema = z.object({
  body: z.object({
    title: z.string().min(5).optional(),
    description: z.string().min(10).optional(),
    status: z.nativeEnum(TicketStatus).optional(),
    priority: z.nativeEnum(TicketPriority).optional(),
    category: z.nativeEnum(TicketCategory).optional(),
    tags: z.array(z.string()).optional(),
    assignedToId: z.string().uuid().optional(),
  }),
});

export const ticketIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID'),
  }),
});

export const assignTicketSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid ticket ID'),
  }),
  body: z.object({
    agentId: z.string().uuid('Invalid agent ID'),
  }),
});
