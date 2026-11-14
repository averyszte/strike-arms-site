import { useQuery } from '@tanstack/react-query';

import { listAppliedMigrations } from '@/data/migrations-repository';
import { compareMigrations } from '@/lib/migration-status';
import { ADMIN_KEYS, GC_TIME_ONE_HOUR, STALE_TIME_HALF_HOUR } from '@/lib/query-keys';

/**
 * Cached for the session. What the database has applied changes when someone
 * runs `supabase db push`, which is not something that happens while an admin
 * has the tab open -- and a refetch on every window focus would be a query
 * against a system table for no benefit.
 */
export function useMigrationStatus() {
  return useQuery({
    queryKey: ADMIN_KEYS.migrationStatus,
    queryFn: async () => {
      const applied = await listAppliedMigrations();
      if (applied.kind === 'check-missing') return { kind: 'check-missing' } as const;
      if (applied.kind === 'not-verified') return { kind: 'not-verified' } as const;
      return { kind: 'ok', status: compareMigrations(applied.versions) } as const;
    },
    staleTime: STALE_TIME_HALF_HOUR,
    gcTime: GC_TIME_ONE_HOUR,
    refetchOnWindowFocus: false,
  });
}
