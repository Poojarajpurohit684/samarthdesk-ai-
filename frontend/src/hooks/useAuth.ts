import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService, LoginCredentials, RegisterData } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, setUser, logout: logoutStore } = useAuthStore();

  // Get current user
  const { isLoading, data, error } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
    enabled: authService.isAuthenticated(),
    retry: false,
  });

  // Update user state when query completes
  React.useEffect(() => {
    if (!isLoading) {
      if (data) {
        setUser(data);
        // Re-connect socket using the stored token (page refresh case)
        const token = authService.getAccessToken();
        if (token) {
          import('../lib/socket').then(({ connectSocket }) => connectSocket(token));
        }
      } else if (error || !authService.isAuthenticated()) {
        setUser(null);
      }
    }
  }, [isLoading, data, error, setUser]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
  });

  React.useEffect(() => {
    if (loginMutation.isSuccess && loginMutation.data) {
      setUser(loginMutation.data.user);
      queryClient.setQueryData(['me'], loginMutation.data.user);
      // Connect socket after successful login
      import('../lib/socket').then(({ connectSocket }) => {
        connectSocket(loginMutation.data.accessToken);
      });
      toast.success('Login successful!');
      
      // Redirect based on role
      if (loginMutation.data.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else if (loginMutation.isError) {
      const error: any = loginMutation.error;
      toast.error(error.response?.data?.message || 'Login failed');
    }
  }, [loginMutation.isSuccess, loginMutation.isError, loginMutation.data, loginMutation.error, navigate, queryClient, setUser]);

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
  });

  React.useEffect(() => {
    if (registerMutation.isSuccess && registerMutation.data) {
      setUser(registerMutation.data.user);
      queryClient.setQueryData(['me'], registerMutation.data.user);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } else if (registerMutation.isError) {
      const error: any = registerMutation.error;
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  }, [registerMutation.isSuccess, registerMutation.isError, registerMutation.data, registerMutation.error, navigate, queryClient, setUser]);

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onError: (error) => {
      console.error('Logout mutation error:', error);
      // Still clear local state even if API fails
      logoutStore();
      queryClient.clear();
      navigate('/login');
    }
  });

  React.useEffect(() => {
    if (logoutMutation.isSuccess) {
      // Disconnect socket on logout
      import('../lib/socket').then(({ disconnectSocket }) => disconnectSocket());
      logoutStore();
      queryClient.clear();
      toast.success('Logged out successfully');
      navigate('/login');
    }
  }, [logoutMutation.isSuccess, navigate, queryClient, logoutStore]);

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });

  React.useEffect(() => {
    if (forgotPasswordMutation.isSuccess) {
      toast.success('Password reset link sent to your email');
    } else if (forgotPasswordMutation.isError) {
      const error: any = forgotPasswordMutation.error;
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    }
  }, [forgotPasswordMutation.isSuccess, forgotPasswordMutation.isError, forgotPasswordMutation.error]);

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
  });

  React.useEffect(() => {
    if (resetPasswordMutation.isSuccess) {
      toast.success('Password reset successful!');
      navigate('/login');
    } else if (resetPasswordMutation.isError) {
      const error: any = resetPasswordMutation.error;
      toast.error(error.response?.data?.message || 'Password reset failed');
    }
  }, [resetPasswordMutation.isSuccess, resetPasswordMutation.isError, resetPasswordMutation.error, navigate]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
};
