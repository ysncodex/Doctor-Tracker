import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type { ApiResponse, DoctorFilterOptions, PatientFilterOptions } from '@/types';

export function useDoctorFilterOptions() {
  return useQuery({
    queryKey: ['doctors', 'filter-options'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DoctorFilterOptions>>('/doctors/filter-options');
      return response.data.data;
    },
  });
}

export function usePatientFilterOptions() {
  return useQuery({
    queryKey: ['patients', 'filter-options'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<PatientFilterOptions>>('/patients/filter-options');
      return response.data.data;
    },
  });
}
