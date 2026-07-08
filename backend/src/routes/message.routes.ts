import { Router } from 'express';
import { messageController } from '../controllers/message.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router({ mergeParams: true }); // inherits :id from ticket routes

router.use(authenticate);

const createMessageSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message cannot be empty').max(10000),
    isInternal: z.boolean().optional(),
  }),
});

const aiImproveSchema = z.object({
  body: z.object({ text: z.string().min(1) }),
});

router.get('/', messageController.getMessages.bind(messageController));
router.post('/', validate(createMessageSchema), messageController.createMessage.bind(messageController));

// AI endpoints — agents/admins only
router.post('/ai-draft',    authorize('ADMIN', 'AGENT'), messageController.aiDraftReply.bind(messageController));
router.post('/ai-summarise', authorize('ADMIN', 'AGENT'), messageController.aiSummarise.bind(messageController));
router.post('/ai-improve',   authorize('ADMIN', 'AGENT'), validate(aiImproveSchema), messageController.aiImproveGrammar.bind(messageController));

export default router;
