import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { validate } from '../middleware/validate';
import { authenticate, authorize } from '../middleware/auth';
import {
  updateProfileSchema,
  updateAvatarSchema,
  createUserSchema,
  updateUserSchema,
  userIdSchema,
} from '../validations/user.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// User profile routes (accessible by user themselves)
router.get('/profile', userController.getProfile.bind(userController));

router.put(
  '/profile',
  validate(updateProfileSchema),
  userController.updateProfile.bind(userController)
);

router.put(
  '/avatar',
  validate(updateAvatarSchema),
  userController.updateAvatar.bind(userController)
);

// Admin-only routes
router.get(
  '/stats',
  authorize('ADMIN'),
  userController.getUserStats.bind(userController)
);

router.get(
  '/',
  authorize('ADMIN', 'AGENT'),
  userController.listUsers.bind(userController)
);

router.get(
  '/:id',
  authorize('ADMIN', 'AGENT'),
  validate(userIdSchema),
  userController.getUserById.bind(userController)
);

router.post(
  '/',
  authorize('ADMIN'),
  validate(createUserSchema),
  userController.createUser.bind(userController)
);

router.put(
  '/:id',
  authorize('ADMIN'),
  validate(userIdSchema),
  validate(updateUserSchema),
  userController.updateUser.bind(userController)
);

router.delete(
  '/:id',
  authorize('ADMIN'),
  validate(userIdSchema),
  userController.deleteUser.bind(userController)
);

router.post(
  '/:id/activate',
  authorize('ADMIN'),
  validate(userIdSchema),
  userController.activateUser.bind(userController)
);

router.post(
  '/:id/deactivate',
  authorize('ADMIN'),
  validate(userIdSchema),
  userController.deactivateUser.bind(userController)
);

export default router;
