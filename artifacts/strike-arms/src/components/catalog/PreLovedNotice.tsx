import { History } from 'lucide-react';

import { soldAsSeenNotice } from '@/lib/product-condition';

/**
 * The secondhand warning, on the page rather than in the description.
 *
 * The importer appends the same sentence to the description of every pre-loved
 * row, but the product page renders the short description and never the body --
 * so until this component existed, the warning Alan asked us to stress was
 * visible only inside the admin.
 */
export function PreLovedNotice({ subcategory }: { subcategory: string }) {
  return (
    <div className="mt-6 rounded-sm border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
        <p className="text-sm font-semibold text-foreground">Pre-loved &mdash; sold as seen</p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{soldAsSeenNotice(subcategory)}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Every pre-loved item is a one-off, so once it is gone it is gone. Come in and have a look
        at it before you buy if you would rather see it in person.
      </p>
    </div>
  );
}
