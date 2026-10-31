import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type { ApiResponse, DoctorFilterOptions, PatientFilterOptions } from '@/types';

/**
 * Filter dropdown values come from the database, not from a hard-coded list.
 *
 * The query keys start with 'doctors' / 'patients' on purpose: every create,
 * update and delete mutation already invalidates those prefixes, so a new
 * specialization, hospital or condition appears in the filters immediately.
 */
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
