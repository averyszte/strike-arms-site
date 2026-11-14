import { useQuery } from '@tanstack/react-query';

import { fetchSystemHealth } from '@/data/system-health-repository';

/** Refreshed every five minutes while the dashboard is open (M-001). */
export function useSystemHealth() {
  return useQuery({
    queryKey: ['admin', 'system-health'],
    queryFn: fetchSystemHealth,
    refetchInterval: 5 * 60 * 1000,
  });
}
