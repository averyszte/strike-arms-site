import { History } from 'lucide-react';

import { useStoreRatesHistory } from '@/hooks/use-store-rates-history';
import { describeRateChanges } from '@/lib/store-rates-form';

const WHEN = new Intl.DateTimeFormat('en-IE', { dateStyle: 'medium', timeStyle: 'short' });

/** The last rate changes, so a slip can be seen and put back (M-029). */
export function StoreRatesHistory() {
  const history = useStoreRatesHistory();
  const rows = history.data ?? [];

  return (
    <section className="mt-6 max-w-md">
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <History className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        Recent rate changes
      </h2>
      {history.isError && (
        <p className="text-sm text-destructive">Could not load the history. Reload to try again.</p>
      )}
      {history.isSuccess && rows.length === 0 && (
        <p className="text-sm text-muted-foreground">No changes recorded yet.</p>
      )}
      <ul className="space-y-2">
        {rows.map(row => (
          <li key={row.id} className="rounded-md border border-border px-3 py-2 text-sm">
            <p className="text-xs text-muted-foreground">{WHEN.format(new Date(row.changedAt))}</p>
            {describeRateChanges(row.before, row.after).map(change => (
              <p key={change.label}>
                {change.label}: {change.from} to <span className="font-semibold">{change.to}</span>
              </p>
            ))}
          </li>
        ))}
      </ul>
    </section>
  );
}
