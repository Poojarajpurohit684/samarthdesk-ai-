import { z } from 'zod';
import { UserRole } from '@prisma/client';

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    phone: z.string().optional(),
  }),
});

export const updateAvatarSchema = z.object({
  body: z.object({
    avatarUrl: z.string().url('Invalid avatar URL'),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        'Password must contain at least one special character'
      ),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    role: z.nativeEnum(UserRole),
    phone: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').optional(),
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    role: z.nativeEnum(UserRole).optional(),
    phone: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const userIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
});
