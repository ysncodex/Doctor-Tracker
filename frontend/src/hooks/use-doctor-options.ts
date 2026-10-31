import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type { ApiResponse, DoctorOption } from '@/types';

/**
 * Every doctor (name-sorted, small payload) for "assign a doctor" dropdowns.
 * Uses a dedicated endpoint, so it is not limited to the first page of the list.
 */
export function useDoctorOptions() {
  return useQuery({
    // Starts with ['doctors'] so doctor mutations that invalidate it refresh this too.
    queryKey: ['doctors', 'assignment-options'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DoctorOption[]>>('/doctors/options');
      return response.data.data;
    },
    staleTime: 5 * 60_000,
  });
}
