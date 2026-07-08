import prisma from '../utils/prisma';
import { hashPassword } from '../utils/password';
import { NotFoundError, ForbiddenError, ConflictError } from '../utils/errors';
import { User, UserRole, Prisma } from '@prisma/client';
interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  isActive?: boolean;
}

interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  phone?: string;
  isActive?: boolean;
}

interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

export class UserService {
  async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileData
  ): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        avatar: data.avatar,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async listUsers(
    page: number = 1,
    limit: number = 10,
    filters?: UserFilters
  ): Promise<{
    users: Omit<User, 'password'>[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    const usersWithoutPassword = users.map(({ password, ...user }) => user);

    return {
      users: usersWithoutPassword,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(userId: string, _requesterId: string): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async createUser(data: CreateUserData, creatorId: string): Promise<Omit<User, 'password'>> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phone: data.phone,
        isActive: data.isActive ?? true,
        isEmailVerified: false,
      },
    });

    // Log audit (only if creator is known)
    if (creatorId) {
      await prisma.auditLog.create({
        data: {
          userId: creatorId,
          action: 'CREATE_USER',
          entity: 'User',
          entityId: user.id,
          changes: {
            email: user.email,
            role: user.role,
          },
        },
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(
    userId: string,
    data: UpdateUserData,
    updaterId: string
  ): Promise<Omit<User, 'password'>> {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundError('User not found');
    }

    // Check email uniqueness if email is being updated
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (emailExists) {
        throw new ConflictError('Email already in use');
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phone: data.phone,
        isActive: data.isActive,
      },
    });

    // Log audit (only if updater is known)
    if (updaterId) {
      await prisma.auditLog.create({
        data: {
          userId: updaterId,
          action: 'UPDATE_USER',
          entity: 'User',
          entityId: userId,
          changes: data as Prisma.InputJsonValue,
        },
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deleteUser(userId: string, deleterId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Prevent self-deletion
    if (userId === deleterId) {
      throw new ForbiddenError('You cannot delete your own account');
    }

    // Soft delete - deactivate instead of actual deletion
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    // Log audit (only if deleter is known)
    if (deleterId) {
      await prisma.auditLog.create({
        data: {
          userId: deleterId,
          action: 'DELETE_USER',
          entity: 'User',
          entityId: userId,
          changes: { isActive: false },
        },
      });
    }
  }

  async activateUser(userId: string, activatorId: string): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });

    // Log audit (only if activator is known)
    if (activatorId) {
      await prisma.auditLog.create({
        data: {
          userId: activatorId,
          action: 'ACTIVATE_USER',
          entity: 'User',
          entityId: userId,
          changes: { isActive: true },
        },
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async deactivateUser(userId: string, deactivatorId: string): Promise<Omit<User, 'password'>> {
    if (userId === deactivatorId) {
      throw new ForbiddenError('You cannot deactivate your own account');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    // Invalidate all sessions
    await prisma.session.deleteMany({
      where: { userId },
    });

    // Log audit (only if deactivator is known)
    if (deactivatorId) {
      await prisma.auditLog.create({
        data: {
          userId: deactivatorId,
          action: 'DEACTIVATE_USER',
          entity: 'User',
          entityId: userId,
          changes: { isActive: false },
        },
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    customers: number;
    agents: number;
    admins: number;
  }> {
    const [total, active, customers, agents, admins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'AGENT' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);

    return { total, active, customers, agents, admins };
  }
}

export const userService = new UserService();
