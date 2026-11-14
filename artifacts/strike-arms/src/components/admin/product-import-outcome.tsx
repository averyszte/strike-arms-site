import type { ImportOutcome } from '@/types/product-import';

/** What an import wrote, with every row the database refused listed by slug. */
export function ProductImportOutcome({ outcome }: { outcome: ImportOutcome }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-foreground">
        {outcome.created} created, {outcome.updated} updated.
      </p>
      {outcome.failures.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-destructive">
            Refused by the database
          </p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {outcome.failures.map((failure) => (
              <li key={failure.slug}>
                <span className="font-mono text-foreground">{failure.slug}</span> &mdash;{' '}
                {failure.message}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            Everything else was written. Fixing those rows and uploading the same file again
            is safe.
          </p>
        </div>
      )}
    </div>
  );
}
