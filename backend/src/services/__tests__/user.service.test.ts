import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userService } from '../user.service';
import prisma from '../../utils/prisma';
import { NotFoundError, ForbiddenError, ConflictError } from '../../utils/errors';

vi.mock('../../utils/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    session: {
      deleteMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
  },
}));

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  password: 'hashed',
  firstName: 'Test',
  lastName: 'User',
  role: 'CUSTOMER' as const,
  isEmailVerified: true,
  isActive: true,
  emailVerificationToken: null,
  resetPasswordToken: null,
  resetPasswordExpires: null,
  avatar: null,
  phone: null,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.auditLog.create).mockResolvedValue({} as any);
  });

  describe('getProfile', () => {
    it('should return user without password', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const result = await userService.getProfile('user-1');

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw NotFoundError when user does not exist', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(userService.getProfile('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('createUser', () => {
    it('should throw ConflictError if email already in use', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      await expect(
        userService.createUser(
          {
            email: 'test@example.com',
            password: 'Test@123',
            firstName: 'Test',
            lastName: 'User',
            role: 'CUSTOMER',
          },
          'admin-1'
        )
      ).rejects.toThrow(ConflictError);
    });

    it('should create user and return without password', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser as any);

      const result = await userService.createUser(
        {
          email: 'new@example.com',
          password: 'Test@123',
          firstName: 'New',
          lastName: 'User',
          role: 'CUSTOMER',
        },
        'admin-1'
      );

      expect(result).not.toHaveProperty('password');
    });
  });

  describe('deleteUser', () => {
    it('should throw ForbiddenError when user tries to delete themselves', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      await expect(userService.deleteUser('user-1', 'user-1')).rejects.toThrow(ForbiddenError);
    });

    it('should throw NotFoundError when user does not exist', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(userService.deleteUser('nonexistent', 'admin-1')).rejects.toThrow(NotFoundError);
    });

    it('should soft-delete user (set isActive false)', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser, isActive: false } as any);

      await userService.deleteUser('user-1', 'admin-1');

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { isActive: false },
      });
    });
  });

  describe('deactivateUser', () => {
    it('should throw ForbiddenError when user deactivates themselves', async () => {
      await expect(userService.deactivateUser('user-1', 'user-1')).rejects.toThrow(ForbiddenError);
    });

    it('should invalidate all sessions on deactivation', async () => {
      vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser, isActive: false } as any);
      vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 2 });

      await userService.deactivateUser('user-1', 'admin-1');

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    });
  });

  describe('getUserStats', () => {
    it('should return stats with all role counts', async () => {
      vi.mocked(prisma.user.count).mockResolvedValue(5);

      const stats = await userService.getUserStats();

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('customers');
      expect(stats).toHaveProperty('agents');
      expect(stats).toHaveProperty('admins');
    });
  });
});
