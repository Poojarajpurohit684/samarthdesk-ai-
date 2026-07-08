import { Router } from 'express';
import { ticketController } from '../controllers/ticket.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import { aiService } from '../services/ai.service';
import { config } from '../config';
import {
  createTicketSchema,
  updateTicketSchema,
  ticketIdSchema,
  assignTicketSchema,
} from '../validations/ticket.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Ticket stats
router.get('/stats', ticketController.getTicketStats.bind(ticketController));

// AI: check for duplicate tickets (Admin/Agent only) — must be before /:id to avoid param collision
router.post(
  '/ai/check-duplicate',
  authorize('ADMIN', 'AGENT'),
  async (req, res, next) => {
    try {
      if (!config.ai.apiKey || config.ai.apiKey === 'your-openai-api-key-here') {
        res.status(503).json({ success: false, message: 'AI service not configured' });
        return;
      }
      const { title, description } = req.body;
      const recent = await (await import('../utils/prisma')).default.ticket.findMany({
        where: { status: { in: ['OPEN', 'PENDING', 'IN_PROGRESS'] } },
        select: { id: true, title: true, description: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      const result = await aiService.detectDuplicate(title, description, recent);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// List tickets
router.get('/', ticketController.getTickets.bind(ticketController));

// Create ticket
router.post(
  '/',
  validate(createTicketSchema),
  ticketController.createTicket.bind(ticketController)
);

// Get ticket by ID
router.get(
  '/:id',
  validate(ticketIdSchema),
  ticketController.getTicketById.bind(ticketController)
);

// Update ticket
router.put(
  '/:id',
  validate(ticketIdSchema),
  validate(updateTicketSchema),
  ticketController.updateTicket.bind(ticketController)
);

// Delete ticket (Admin only)
router.delete(
  '/:id',
  authorize('ADMIN'),
  validate(ticketIdSchema),
  ticketController.deleteTicket.bind(ticketController)
);

// Assign ticket (Admin/Agent only)
router.post(
  '/:id/assign',
  authorize('ADMIN', 'AGENT'),
  validate(assignTicketSchema),
  ticketController.assignTicket.bind(ticketController)
);

export default router;
