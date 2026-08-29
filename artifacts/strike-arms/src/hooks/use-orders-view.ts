import { useCallback, useState } from 'react';

import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Which order view the admin is looking at, remembered between visits.
 *
 * Two things the florist's build got right and paid for learning: the choice
 * has to persist, because whoever works the counter picks one and wants it
 * again tomorrow; and the board has to be off below 768px, because six lanes
 * side by side on a phone is a horizontal scroll with nothing readable in it.
 *
 * The stored value is untrusted on the way back in — it is a string a user can
 * edit — so anything that is not one of the two modes is discarded.
 */

export type OrdersViewMode = 'table' | 'board';

const STORAGE_KEY = 'strike-arms:admin:orders-view:v1';

function isViewMode(value: unknown): value is OrdersViewMode {
  return value === 'table' || value === 'board';
}

function readStoredView(): OrdersViewMode {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isViewMode(raw) ? raw : 'table';
  } catch {
    // Private browsing and blocked site data both throw here. The table is a
    // fine answer to not knowing.
    return 'table';
  }
}

export function useOrdersView() {
  const isMobile = useIsMobile();
  const [stored, setStored] = useState<OrdersViewMode>(readStoredView);

  const setView = useCallback((next: OrdersViewMode) => {
    setStored(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not being able to remember the choice is not a reason to refuse it.
    }
  }, []);

  return {
    view: isMobile ? ('table' as const) : stored,
    setView,
    /** True when the board is unavailable because the screen is too narrow. */
    isTableForced: isMobile,
  };
}
