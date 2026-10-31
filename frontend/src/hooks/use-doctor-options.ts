import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type { ApiResponse, DoctorOption } from '@/types';

export function useDoctorOptions() {
  return useQuery({
    queryKey: ['doctors', 'assignment-options'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DoctorOption[]>>('/doctors/options');
      return response.data.data;
    },
    staleTime: 5 * 60_000,
  });
}
