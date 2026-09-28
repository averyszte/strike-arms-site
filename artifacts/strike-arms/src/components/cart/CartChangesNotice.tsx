import { Info } from 'lucide-react';

import { hasCartChanges } from '@/lib/cart-refresh';
import { PANEL } from '@/lib/storefront-styles';
import type { CartRefreshChanges } from '@/types/cart-freshness';

function listNames(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/**
 * Says what changed when the basket was checked against the shop, so a new
 * total or a missing line is never a silent surprise.
 */
export function CartChangesNotice({ changes }: { changes: CartRefreshChanges }) {
  if (!hasCartChanges(changes)) return null;

  return (
    <div className={`${PANEL} mb-8 flex items-start gap-3 p-4`} role="status">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      <div className="space-y-1 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Your cart has been updated</p>
        {changes.repriced.length > 0 && (
          <p>The price of {listNames(changes.repriced)} has changed since you added it.</p>
        )}
        {changes.noLongerShippable.length > 0 && (
          <p>{listNames(changes.noLongerShippable)} is now collect-in-store only.</p>
        )}
        {changes.removed.length > 0 && (
          <p>{listNames(changes.removed)} is no longer available and has been removed.</p>
        )}
      </div>
    </div>
  );
}
