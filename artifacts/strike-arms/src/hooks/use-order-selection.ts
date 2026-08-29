import { useCallback, useMemo, useState } from 'react';

import type { Order } from '@/types/order';

/**
 * Which orders are ticked in the table.
 *
 * The selection is always intersected with what is on screen. Change the
 * filter, or archive the rows you picked, and they stop being selected —
 * because a bulk action against rows you can no longer see is how someone
 * marks the wrong twenty orders shipped and never finds out which.
 */
export function useOrderSelection(orders: Order[]) {
  const [picked, setPicked] = useState<ReadonlySet<string>>(() => new Set<string>());

  const selectedIds = useMemo(
    () => orders.map((order) => order.id).filter((id) => picked.has(id)),
    [orders, picked],
  );

  const selectedOrders = useMemo(
    () => orders.filter((order) => picked.has(order.id)),
    [orders, picked],
  );

  const toggle = useCallback((id: string) => {
    setPicked((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setPicked((current) => {
      const allPicked = orders.length > 0 && orders.every((order) => current.has(order.id));
      return allPicked ? new Set<string>() : new Set(orders.map((order) => order.id));
    });
  }, [orders]);

  const clear = useCallback(() => setPicked(new Set<string>()), []);

  return {
    selectedIds,
    selectedOrders,
    isSelected: useCallback((id: string) => picked.has(id), [picked]),
    toggle,
    toggleAll,
    clear,
    areAllSelected: orders.length > 0 && selectedIds.length === orders.length,
    areSomeSelected: selectedIds.length > 0 && selectedIds.length < orders.length,
  };
}
