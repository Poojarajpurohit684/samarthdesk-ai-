import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../auth.service';
import prisma from '../../utils/prisma';
import { ConflictError, UnauthorizedError } from '../../utils/errors';

// Mock Prisma
vi.mock('../../utils/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'CUSTOMER',
        isEmailVerified: false,
        emailVerificationToken: 'token',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        avatar: null,
        phone: null,
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);
      vi.mocked(prisma.session.create).mockResolvedValue({} as any);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'Test@123',
        firstName: 'Test',
        lastName: 'User',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw ConflictError if user already exists', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({} as any);

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'Test@123',
          firstName: 'Test',
          lastName: 'User',
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedError if user does not exist', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'password',
        })
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
