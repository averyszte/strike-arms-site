import { AlertTriangle, FilePlus2, FileWarning, PencilLine } from 'lucide-react';

import type { ImportPlan } from '@/lib/product-import';

/**
 * What the file would do, before it does any of it.
 *
 * The counts are the headline, and creates are counted apart from updates on
 * purpose: rows are matched on slug, so a slug edited in the spreadsheet shows
 * up here as a new product rather than a rename. Seeing "40 new" where you
 * expected "40 updated" is the moment to stop.
 *
 * Only the first few rows of each list are shown. The point is to recognise a
 * mistake, not to read two hundred diffs.
 */

const SHOWN = 8;

type ProductImportPreviewProps = {
  plan: ImportPlan;
};

function Count({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
      {icon}
      <div>
        <p className="text-sm font-semibold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function ProductImportPreview({ plan }: ProductImportPreviewProps) {
  if (plan.fatal) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>{plan.fatal}</p>
      </div>
    );
  }

  const notices: string[] = [];
  if (plan.stockRowsIgnored > 0) {
    notices.push(
      `Stock is not imported. ${plan.stockRowsIgnored} row${plan.stockRowsIgnored === 1 ? '' : 's'} would have changed it — use Adjust stock instead, so the inventory history records who and why.`,
    );
  }
  if (plan.unknownColumns.length > 0) {
    notices.push(`Columns not recognised and ignored: ${plan.unknownColumns.join(', ')}.`);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Count
          icon={<FilePlus2 className="h-4 w-4 text-accent" aria-hidden="true" />}
          value={plan.creates.length}
          label="new products"
        />
        <Count
          icon={<PencilLine className="h-4 w-4 text-accent" aria-hidden="true" />}
          value={plan.updates.length}
          label="to update"
        />
        <Count
          icon={<span className="h-4 w-4" aria-hidden="true" />}
          value={plan.unchanged}
          label="already match"
        />
        <Count
          icon={<FileWarning className="h-4 w-4 text-destructive" aria-hidden="true" />}
          value={plan.problems.length}
          label="rejected"
        />
      </div>

      {notices.map((notice) => (
        <p key={notice} className="text-xs text-muted-foreground">
          {notice}
        </p>
      ))}

      {plan.creates.length > 0 && (
        <section>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            New products
          </h4>
          <ul className="space-y-1 text-sm">
            {plan.creates.slice(0, SHOWN).map((create) => (
              <li key={create.slug} className="text-foreground">
                {create.name}{' '}
                <span className="font-mono text-xs text-muted-foreground">{create.slug}</span>
              </li>
            ))}
          </ul>
          {plan.creates.length > SHOWN && (
            <p className="mt-1 text-xs text-muted-foreground">
              and {plan.creates.length - SHOWN} more
            </p>
          )}
        </section>
      )}

      {plan.updates.length > 0 && (
        <section>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Changes
          </h4>
          <ul className="space-y-2 text-sm">
            {plan.updates.slice(0, SHOWN).map((update) => (
              <li key={update.slug}>
                <p className="font-medium text-foreground">{update.name}</p>
                <ul className="mt-0.5 space-y-0.5">
                  {update.changes.map((change) => (
                    <li key={change.field} className="text-xs text-muted-foreground">
                      {change.label}: <span className="line-through">{change.from || 'empty'}</span>{' '}
                      <span className="text-foreground">{change.to || 'empty'}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          {plan.updates.length > SHOWN && (
            <p className="mt-1 text-xs text-muted-foreground">
              and {plan.updates.length - SHOWN} more
            </p>
          )}
        </section>
      )}

      {plan.problems.length > 0 && (
        <section>
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-destructive">
            Rejected rows
          </h4>
          <p className="mb-1.5 text-xs text-muted-foreground">
            These are skipped. Everything else still imports.
          </p>
          <ul className="space-y-1 text-xs">
            {plan.problems.slice(0, SHOWN).map((problem) => (
              <li key={`${problem.line}-${problem.slug}`}>
                <span className="font-medium text-foreground">Row {problem.line}</span>
                {problem.slug && (
                  <span className="font-mono text-muted-foreground"> {problem.slug}</span>
                )}
                <span className="text-muted-foreground"> — {problem.messages.join('; ')}</span>
              </li>
            ))}
          </ul>
          {plan.problems.length > SHOWN && (
            <p className="mt-1 text-xs text-muted-foreground">
              and {plan.problems.length - SHOWN} more
            </p>
          )}
        </section>
      )}
    </div>
  );
}
