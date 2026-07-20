import { api } from '../lib/axios';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CUSTOMER' | 'AGENT' | 'ADMIN';
  isEmailVerified: boolean;
  isActive: boolean;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    const authData = response.data.data;

    this.setTokens(authData.accessToken, authData.refreshToken);

    return authData;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    const authData = response.data.data;

    this.setTokens(authData.accessToken, authData.refreshToken);

    return authData;
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = localStorage.getItem('accessToken');
      
      // Only call backend logout if we have tokens
      if (refreshToken && accessToken) {
        // Set authorization header for logout request
        const authHeader = `Bearer ${accessToken}`;
        await api.post('/auth/logout', 
          { refreshToken }, 
          { headers: { Authorization: authHeader } }
        );
      }
    } catch (error) {
      // Ignore logout API errors — tokens will expire naturally
      console.warn('Logout API failed, clearing tokens locally:', error);
    } finally {
      // Always clear tokens regardless of API success/failure
      this.clearTokens();
    }
  }

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data.data;
  }

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  }

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    await api.post('/auth/change-password', data);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
