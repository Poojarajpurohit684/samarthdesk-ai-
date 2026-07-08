import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
} from '../validations/auth.validation';

const router = Router();

// Public routes
router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  authController.register.bind(authController)
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  authController.login.bind(authController)
);

router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
  authController.refreshToken.bind(authController)
);

router.post(
  '/verify-email',
  validate(verifyEmailSchema),
  authController.verifyEmail.bind(authController)
);

router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword.bind(authController)
);

router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword.bind(authController)
);

// Protected routes
router.post('/logout', authenticate, authController.logout.bind(authController));

router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword.bind(authController)
);

router.get('/me', authenticate, authController.getMe.bind(authController));

export default router;
