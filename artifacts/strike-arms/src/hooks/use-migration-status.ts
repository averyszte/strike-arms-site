import { useQuery } from '@tanstack/react-query';

import { listAppliedMigrations } from '@/data/migrations-repository';
import type { MigrationAlertInput } from '@/lib/migration-alerts';
import { compareMigrations } from '@/lib/migration-status';

/**
 * Cached for the session. What the database has applied changes when someone
 * runs `supabase db push`, which is not something that happens while an admin
 * has the tab open -- and a refetch on every window focus would be a query
 * against a system table for no benefit.
 */
export function useMigrationStatus() {
  return useQuery({
    queryKey: ['migration-status'],
    queryFn: async () => {
      const applied = await listAppliedMigrations();
      if (applied.kind === 'check-missing') return { kind: 'check-missing' } as const;
      return { kind: 'ok', status: compareMigrations(applied.versions) } as const;
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

/**
 * The same answer, shaped for the dashboard alert. Undefined while loading, or
 * if the query failed for a reason other than the function being absent -- an
 * alert that says nothing is pending because it never got an answer is worse
 * than no alert at all.
 */
export function useMigrationAlertInput(): MigrationAlertInput | undefined {
  const { data } = useMigrationStatus();
  if (!data) return undefined;
  if (data.kind === 'check-missing') return { kind: 'check-missing' };
  return { kind: 'ok', pendingCount: data.status.pending.length };
}
