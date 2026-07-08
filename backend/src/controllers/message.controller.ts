import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';
import prisma from '../utils/prisma';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { enqueueAiSummarise } from '../services/queue.service';
import { aiService } from '../services/ai.service';
import { config } from '../config';
import { emitToTicket, emitToUser } from '../server';

export class MessageController {
  /** GET /tickets/:id/messages */
  async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: ticketId } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) throw new NotFoundError('Ticket not found');

      if (userRole === 'CUSTOMER' && ticket.createdById !== userId) {
        throw new ForbiddenError('Access denied');
      }

      const messages = await prisma.ticketMessage.findMany({
        where: { ticketId },
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, role: true, avatar: true },
          },
          attachments: true,
        },
      });

      res.json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  }

  /** POST /tickets/:id/messages */
  async createMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: ticketId } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const { message, isInternal = false } = req.body;

      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) throw new NotFoundError('Ticket not found');

      if (userRole === 'CUSTOMER' && ticket.createdById !== userId) {
        throw new ForbiddenError('Access denied');
      }
      // Internal notes only for agents/admins
      if (isInternal && userRole === 'CUSTOMER') {
        throw new ForbiddenError('Customers cannot post internal notes');
      }

      const newMessage = await prisma.ticketMessage.create({
        data: { ticketId, userId, message, isInternal },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, role: true, avatar: true },
          },
        },
      });

      // Notify ticket creator when agent/admin replies
      if (userRole !== 'CUSTOMER' && !isInternal) {
        await prisma.notification.create({
          data: {
            userId: ticket.createdById,
            ticketId,
            type: 'NEW_MESSAGE',
            title: 'New reply on your ticket',
            message: `Your ticket #${ticket.ticketNumber} has a new reply.`,
          },
        });
        // Real-time notification to ticket creator
        emitToUser(ticket.createdById, 'notification', {
          type: 'NEW_MESSAGE',
          ticketId,
          ticketNumber: ticket.ticketNumber,
        });
      }

      // Broadcast the new message to everyone in the ticket room
      emitToTicket(ticketId, 'message:new', newMessage);

      logger.info(`Message added to ticket ${ticketId} by ${userId}`);

      res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
      next(error);
    }
  }

  /** POST /tickets/:id/messages/ai-draft */
  async aiDraftReply(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: ticketId } = req.params;
      const { tone = 'PROFESSIONAL' } = req.body;

      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          messages: { orderBy: { createdAt: 'asc' }, select: { message: true, user: { select: { firstName: true, role: true } } } },
        },
      });
      if (!ticket) throw new NotFoundError('Ticket not found');

      if (!config.ai.apiKey || config.ai.apiKey === 'your-openai-api-key-here') {
        res.status(503).json({ success: false, message: 'AI service not configured' });
        return;
      }

      const msgLines = ticket.messages.map((m) => `${m.user.firstName} (${m.user.role}): ${m.message}`);
      const draft = await aiService.draftReply(ticketId, ticket.title, ticket.description, msgLines, tone);

      res.json({ success: true, data: { draft } });
    } catch (error) {
      next(error);
    }
  }

  /** POST /tickets/:id/messages/ai-summarise */
  async aiSummarise(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: ticketId } = req.params;

      if (!config.ai.apiKey || config.ai.apiKey === 'your-openai-api-key-here') {
        res.status(503).json({ success: false, message: 'AI service not configured' });
        return;
      }

      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
      if (!ticket) throw new NotFoundError('Ticket not found');

      const msgLines = ticket.messages.map((m) => m.message);
      await enqueueAiSummarise(ticketId, ticket.title, ticket.description, msgLines);

      res.json({ success: true, message: 'Summary queued' });
    } catch (error) {
      next(error);
    }
  }

  /** POST /tickets/:id/messages/ai-improve */
  async aiImproveGrammar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id: ticketId } = req.params;
      const { text } = req.body;

      if (!text) {
        res.status(400).json({ success: false, message: 'text is required' });
        return;
      }
      if (!config.ai.apiKey || config.ai.apiKey === 'your-openai-api-key-here') {
        res.status(503).json({ success: false, message: 'AI service not configured' });
        return;
      }

      const improved = await aiService.improveGrammar(ticketId, text);
      res.json({ success: true, data: { improved } });
    } catch (error) {
      next(error);
    }
  }
}

export const messageController = new MessageController();
