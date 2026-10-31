import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { PAGE_SIZE } from '@/lib/constants';
import type { ApiResponse, Doctor, PaginatedResponse, Patient } from '@/types';

export function useDoctor(id: string | undefined) {
  return useQuery({
    queryKey: ['doctors', id],
    queryFn: async () => {
      const response = await api.get<ApiResponse<{ doctor: Doctor }>>(`/doctors/${id}`);
      return response.data.data.doctor;
    },
    enabled: Boolean(id),
  });
}

export function useDoctorPatients(id: string | undefined, page: number) {
  return useQuery({
    queryKey: ['doctors', id, 'patients', page],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Patient>>(`/doctors/${id}/patients`, {
        params: { page, limit: PAGE_SIZE },
      });
      return response.data;
    },
    enabled: Boolean(id),
    placeholderData: (previous) => previous,
  });
}
