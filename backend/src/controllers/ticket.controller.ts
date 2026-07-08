import { Response, NextFunction } from 'express';
import { ticketService } from '../services/ticket.service';
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';

export class TicketController {
  async createTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const ticket = await ticketService.createTicket(req.body, userId);

      logger.info(`Ticket created: ${ticket.ticketNumber} by ${userId}`);

      res.status(201).json({
        success: true,
        message: 'Ticket created successfully',
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTickets(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const filters = {
        status: req.query.status as any,
        priority: req.query.priority as any,
        category: req.query.category as any,
        assignedToId: req.query.assignedToId as string,
        createdById: req.query.createdById as string,
        search: req.query.search as string,
      };

      const result = await ticketService.getTickets(page, limit, filters, userId, userRole);

      res.json({
        success: true,
        data: result.tickets,
        pagination: {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTicketById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const ticket = await ticketService.getTicketById(id, userId, userRole);

      res.json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const ticket = await ticketService.updateTicket(id, req.body, userId, userRole);

      logger.info(`Ticket updated: ${id} by ${userId}`);

      res.json({
        success: true,
        message: 'Ticket updated successfully',
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      await ticketService.deleteTicket(id, userId, userRole);

      logger.info(`Ticket deleted: ${id} by ${userId}`);

      res.json({
        success: true,
        message: 'Ticket deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async assignTicket(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { agentId } = req.body;
      const userId = req.user!.id;

      const ticket = await ticketService.assignTicket(id, agentId, userId);

      logger.info(`Ticket assigned: ${id} to ${agentId} by ${userId}`);

      res.json({
        success: true,
        message: 'Ticket assigned successfully',
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTicketStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.role === 'ADMIN' ? undefined : req.user!.id;
      const userRole = req.user!.role;

      const stats = await ticketService.getTicketStats(userId, userRole);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const ticketController = new TicketController();
