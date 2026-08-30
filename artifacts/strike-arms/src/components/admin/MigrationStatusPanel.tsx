import { AlertTriangle, CheckCircle2, Loader2, OctagonAlert } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMigrationStatus } from '@/hooks/use-migration-status';
import type { MigrationFile } from '@/lib/migration-manifest';

/**
 * Whether the database has the migrations this build was compiled from.
 *
 * The list on the left is generated from supabase/migrations at build time,
 * so it is the deploy talking, not a note someone kept up to date. The list on
 * the right comes from the database itself. Anything in one and not the other
 * is named here rather than summarised, because "3 pending" sends you looking
 * and "014, 015, 016" tells you what to push.
 */

const PUSH_COMMAND = 'supabase db push';

function MigrationList({ items }: { items: MigrationFile[] }) {
  return (
    <ul className="mt-2 space-y-1">
      {items.map((migration) => (
        <li key={migration.version} className="font-mono text-xs text-foreground">
          {migration.file}
        </li>
      ))}
    </ul>
  );
}

function PushInstruction() {
  return (
    <p className="mt-3 text-xs text-muted-foreground">
      Run <code className="rounded bg-muted px-1 py-0.5 font-mono">{PUSH_COMMAND}</code> from the
      repository root, then reload this page.
    </p>
  );
}

export function MigrationStatusPanel() {
  const { data, isLoading, error } = useMigrationStatus();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Database migrations</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Checking what the database has applied
          </div>
        )}

        {/* An error here is not "everything is fine". The check could not run,
            and saying so is the whole point of having it. */}
        {!isLoading && error && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              The migration check could not run
              {error instanceof Error ? `: ${error.message}` : '.'}
            </span>
          </div>
        )}

        {data?.kind === 'check-missing' && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <OctagonAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">The database is behind the code.</p>
              <p className="mt-1 text-muted-foreground">
                The function this check calls arrives in migration 016, and the database does not
                have it. That is not a fault in the check — it is the answer.
              </p>
              <PushInstruction />
            </div>
          </div>
        )}

        {data?.kind === 'ok' && data.status.isInSync && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              All {data.status.applied.length} migrations in this build are applied to the database.
            </span>
          </div>
        )}

        {data?.kind === 'ok' && data.status.pending.length > 0 && (
          <div className="flex items-start gap-2 text-sm text-destructive">
            <OctagonAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-medium">
                {data.status.pending.length}{' '}
                {data.status.pending.length === 1 ? 'migration is' : 'migrations are'} in the code
                but not in the database.
              </p>
              <MigrationList items={data.status.pending} />
              <PushInstruction />
            </div>
          </div>
        )}

        {data?.kind === 'ok' && data.status.unexpected.length > 0 && (
          <div className="mt-4 flex items-start gap-2 text-sm text-foreground">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-500"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="font-medium">
                The database has {data.status.unexpected.length} migration
                {data.status.unexpected.length === 1 ? '' : 's'} this build does not.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Either this build is older than the database, or SQL was run by hand in the Supabase
                dashboard — in which case it will be lost the next time the database is rebuilt from
                migrations.
              </p>
              <p className="mt-2 font-mono text-xs">{data.status.unexpected.join(', ')}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
