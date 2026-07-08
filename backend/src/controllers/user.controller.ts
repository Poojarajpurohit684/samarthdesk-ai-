import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { AuthRequest } from '../types';
import { logger } from '../utils/logger';

export class UserController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await userService.getProfile(userId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await userService.updateProfile(userId, req.body);

      logger.info(`User updated profile: ${userId}`);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAvatar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { avatarUrl } = req.body;

      const user = await userService.updateAvatar(userId, avatarUrl);

      logger.info(`User updated avatar: ${userId}`);

      res.json({
        success: true,
        message: 'Avatar updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async listUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const role = req.query.role as any;
      const isActive = req.query.isActive === 'true' ? true : 
                       req.query.isActive === 'false' ? false : undefined;
      const search = req.query.search as string;

      const result = await userService.listUsers(page, limit, {
        role,
        isActive,
        search,
      });

      res.json({
        success: true,
        data: result.users,
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

  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const requesterId = req.user!.id;

      const user = await userService.getUserById(id, requesterId);

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const creatorId = req.user!.id;
      const user = await userService.createUser(req.body, creatorId);

      logger.info(`User created by admin: ${user.email}`);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updaterId = req.user!.id;

      const user = await userService.updateUser(id, req.body, updaterId);

      logger.info(`User updated by admin: ${id}`);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleterId = req.user!.id;

      await userService.deleteUser(id, deleterId);

      logger.info(`User deleted by admin: ${id}`);

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async activateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const activatorId = req.user!.id;

      const user = await userService.activateUser(id, activatorId);

      logger.info(`User activated by admin: ${id}`);

      res.json({
        success: true,
        message: 'User activated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async deactivateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deactivatorId = req.user!.id;

      const user = await userService.deactivateUser(id, deactivatorId);

      logger.info(`User deactivated by admin: ${id}`);

      res.json({
        success: true,
        message: 'User deactivated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserStats(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await userService.getUserStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
