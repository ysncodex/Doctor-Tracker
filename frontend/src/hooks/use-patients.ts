'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { toDateParams } from '@/lib/date-range';
import { cleanParams } from '@/lib/query-params';
import { toast } from 'sonner';
import type { Patient, PaginatedResponse } from '@/types';

export interface PatientFilters {
  page: number;
  limit: number;
  search?: string;
  condition?: string;
  gender?: string;
  doctorId?: string;
  sort?: string;
  startDate?: string;
  endDate?: string;
}

export function usePatients(filters: PatientFilters) {
  return useQuery({
    queryKey: ['patients', 'list', filters],
    queryFn: async () => {
      const { startDate = '', endDate = '', ...rest } = filters;

      const response = await api.get<PaginatedResponse<Patient>>('/patients', {
        params: cleanParams({ ...rest, ...toDateParams(startDate, endDate) }),
      });

      return response.data;
    },
    placeholderData: (previous) => previous,
  });
}

export function usePatientMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['patients'] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    void queryClient.invalidateQueries({ queryKey: ['doctors'] });
  };

  const create = useMutation({
    mutationFn: async (data: {
      doctorId: string;
      name: string;
      age: number;
      gender: Patient['gender'];
      phone: string;
      condition: string;
    }) => {
      const response = await api.post('/patients', data);
      return response.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Patient created successfully');
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Patient> }) => {
      const response = await api.patch(`/patients/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Patient updated successfully');
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/patients/${id}`);
      return response.data;
    },
    onSuccess: () => {
      invalidate();
      toast.success('Patient deleted successfully');
    },
  });

  return { create, update, remove };
}
