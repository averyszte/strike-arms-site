import type { OperationalAlert } from '@/types/admin-alert';

/**
 * The dashboard alert for migrations that exist in the repo but not in the
 * database.
 *
 * This is on the dashboard rather than only on Settings because the entire
 * failure mode is that nobody notices. A shop whose database is a migration
 * behind keeps serving pages and returning HTTP 200 right up until a customer
 * reaches the one path that needed the missing function. Settings is not a
 * screen anyone opens; the dashboard is the screen they land on.
 */

export type MigrationAlertInput =
  /** applied_migrations() answered. */
  | { kind: 'ok'; pendingCount: number }
  /**
   * applied_migrations() is not in the database. It arrives in migration 016,
   * so its absence is itself proof the database is behind -- which is why this
   * is an alert and not a quiet "unknown".
   */
  | { kind: 'check-missing' };

const HREF = '/admin/settings';
const ACTION = 'Run supabase db push -- see Settings';

export function migrationAlerts(input: MigrationAlertInput | undefined): OperationalAlert[] {
  // Undefined means still loading, or the query failed for a reason that is
  // not "the function is missing". Nothing is claimed either way: an alert
  // that reads "0 pending" because it never got an answer is worse than none.
  if (!input) return [];

  if (input.kind === 'check-missing') {
    return [
      {
        id: 'migrations-check-missing',
        severity: 'critical',
        count: 1,
        title: 'The database is behind the code',
        action: `The migration check itself is not installed. ${ACTION}`,
        href: HREF,
      },
    ];
  }

  if (input.pendingCount <= 0) return [];

  const plural = input.pendingCount === 1 ? 'migration is' : 'migrations are';
  return [
    {
      id: 'migrations-pending',
      severity: 'critical',
      count: input.pendingCount,
      title: `${input.pendingCount} ${plural} in the code but not in the database`,
      action: ACTION,
      href: HREF,
    },
  ];
}
