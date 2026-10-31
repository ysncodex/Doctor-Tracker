'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { AdminUser, ApiResponse } from '@/types';

export function useAuth() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ user: AdminUser }>>('/auth/me');

      return response.data.data.user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post<ApiResponse<{ user: AdminUser }>>('/auth/login', credentials);

      return response.data.data.user;
    },

    onSuccess: (user) => {
      queryClient.setQueryData(['auth', 'me'], user);
      router.replace('/dashboard');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },

    onSuccess: () => {
      queryClient.clear();
      router.replace('/login');
    },
    onError: () => {
      toast.error('Unable to sign out. Please check your connection and try again.');
    },
  });
}
