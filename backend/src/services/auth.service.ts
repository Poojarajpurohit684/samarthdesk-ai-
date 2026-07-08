import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateVerificationToken,
  generateResetToken,
} from '../utils/jwt';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from '../utils/errors';
import { emailService } from './email.service';
import { logger } from '../utils/logger';
import { AuthUser } from '../types';
import { User, UserRole } from '@prisma/client';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
}

interface LoginData {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

interface AuthResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role || UserRole.CUSTOMER,
        emailVerificationToken: verificationToken,
      },
    });

    // Generate tokens
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = generateAccessToken(authUser);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Send verification email (fire-and-forget — don't fail registration if email fails)
    emailService.sendVerificationEmail(user.email, verificationToken).catch((err) =>
      logger.warn(`Failed to send verification email to ${user.email}:`, err)
    );
    emailService.sendWelcomeEmail(user.email, user.firstName).catch(() => void 0);

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const accessToken = generateAccessToken(authUser);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    // Verify refresh token
    try {
      verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Check if session expired
    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedError('Refresh token expired');
    }

    const user = session.user;

    // Generate new tokens
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const newAccessToken = generateAccessToken(authUser);
    const newRefreshToken = generateRefreshToken(user.id);

    // Update session
    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { refreshToken },
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new NotFoundError('Invalid verification token');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
      },
    });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    const resetToken = generateResetToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // Send reset email (fire-and-forget)
    emailService.sendPasswordResetEmail(user.email, resetToken).catch((err) =>
      logger.warn(`Failed to send reset email to ${user.email}:`, err)
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    // Invalidate all sessions
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Invalidate all sessions except current one would be better
    // For now, we'll keep sessions active
  }

  async getMe(userId: string): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();
