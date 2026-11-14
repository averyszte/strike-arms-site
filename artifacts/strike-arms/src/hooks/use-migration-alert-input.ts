import { useMigrationStatus } from '@/hooks/use-migration-status';
import type { MigrationAlertInput } from '@/lib/migration-alerts';

/**
 * The migration status, shaped for the dashboard alert. Undefined while
 * loading, or if the query failed for a reason other than the function being
 * absent -- an alert that says nothing is pending because it never got an
 * answer is worse than no alert at all.
 */
export function useMigrationAlertInput(): MigrationAlertInput | undefined {
  const { data } = useMigrationStatus();
  // An unverified session proves nothing about the database either way.
  if (!data || data.kind === 'not-verified') return undefined;
  if (data.kind === 'check-missing') return { kind: 'check-missing' };
  return { kind: 'ok', pendingCount: data.status.pending.length };
}
