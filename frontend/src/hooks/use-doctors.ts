'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { toDateParams } from '@/lib/date-range';
import { cleanParams } from '@/lib/query-params';
import { toast } from 'sonner';
import type { Doctor, PaginatedResponse } from '@/types';

export interface DoctorFilters {
  page: number;
  limit: number;
  search?: string;
  specialization?: string;
  hospital?: string;
  sort?: string;
  startDate?: string;
  endDate?: string;
}

export function useDoctors(filters: DoctorFilters) {
  return useQuery({
    queryKey: ['doctors', 'list', filters],
    queryFn: async () => {
      const { startDate = '', endDate = '', ...rest } = filters;

      const response = await api.get<PaginatedResponse<Doctor>>('/doctors', {
        params: cleanParams({ ...rest, ...toDateParams(startDate, endDate) }),
      });

      return response.data;
    },
    placeholderData: (previous) => previous,
  });
}

export function useDoctorMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['doctors'] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const create = useMutation({
    mutationFn: async (data: Omit<Doctor, '_id' | 'createdAt'>) => {
      const response = await api.post('/doctors', data);
      return response.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Doctor created successfully');
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Doctor> }) => {
      const response = await api.patch(`/doctors/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Doctor updated successfully');
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/doctors/${id}`);
      return response.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Doctor deleted successfully');
    },
  });

  return { create, update, remove };
}
