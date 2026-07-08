import { api } from '../lib/axios';
import { User } from './auth.service';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'AGENT' | 'ADMIN';
  phone?: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'CUSTOMER' | 'AGENT' | 'ADMIN';
  phone?: string;
  isActive?: boolean;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: 'CUSTOMER' | 'AGENT' | 'ADMIN';
  isActive?: boolean;
  search?: string;
}

export interface UserStats {
  total: number;
  active: number;
  customers: number;
  agents: number;
  admins: number;
}

class UserService {
  async getProfile(): Promise<User> {
    const response = await api.get('/users/profile');
    return response.data.data;
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await api.put('/users/profile', data);
    return response.data.data;
  }

  async updateAvatar(avatarUrl: string): Promise<User> {
    const response = await api.put('/users/avatar', { avatarUrl });
    return response.data.data;
  }

  async listUsers(params?: UserListParams): Promise<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get('/users', { params });
    return {
      users: response.data.data,
      pagination: response.data.pagination,
    };
  }

  async getUserById(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  }

  async createUser(data: CreateUserData): Promise<User> {
    const response = await api.post('/users', data);
    return response.data.data;
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const response = await api.put(`/users/${id}`, data);
    return response.data.data;
  }

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  async activateUser(id: string): Promise<User> {
    const response = await api.post(`/users/${id}/activate`);
    return response.data.data;
  }

  async deactivateUser(id: string): Promise<User> {
    const response = await api.post(`/users/${id}/deactivate`);
    return response.data.data;
  }

  async getUserStats(): Promise<UserStats> {
    const response = await api.get('/users/stats');
    return response.data.data;
  }
}

export const userService = new UserService();
