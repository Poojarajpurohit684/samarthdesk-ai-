import { Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';

export class AuthController {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);

      logger.info(`User registered: ${result.user.email}`);

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your email.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.login({
        ...req.body,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      logger.info(`User logged in: ${result.user.email}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);

      logger.info(`User logged out: ${req.user?.email}`);

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      await authService.verifyEmail(token);

      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);

      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);

      res.json({
        success: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;

      await authService.changePassword(userId, currentPassword, newPassword);

      logger.info(`Password changed for user: ${req.user?.email}`);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await authService.getMe(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
