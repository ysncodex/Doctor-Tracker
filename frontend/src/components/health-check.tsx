'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export default function HealthCheck() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['api-health'],
    queryFn: async () => {
      const response = await api.get<HealthResponse>('/health');
      return response.data;
    },
  });

  if (isLoading) {
    return <p>Connecting to backend...</p>;
  }

  if (isError || !data) {
    return (
      <div className="text-red-600">
        Backend connection failed: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-5">
      <p className="font-semibold text-green-700">✓ {data.message}</p>
      <p className="mt-2 text-sm text-gray-600">Server time: {data.timestamp}</p>
    </div>
  );
}
