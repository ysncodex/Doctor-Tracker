import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type { ApiResponse, DashboardStats } from '@/types';

export const dashboardKeys = {
  stats: ['dashboard', 'stats'] as const,
};

async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<ApiResponse<DashboardStats>>('/dashboard/stats');
  return response.data.data;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats,
    queryFn: fetchDashboardStats,
    staleTime: 60_000,
  });
}
