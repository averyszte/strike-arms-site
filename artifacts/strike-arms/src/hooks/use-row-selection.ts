import { useCallback, useMemo, useState } from 'react';

/**
 * Which rows are ticked in an admin table.
 *
 * The selection is always intersected with what is on screen. Change the
 * filter, or archive the rows you picked, and they stop being selected --
 * because a bulk action against rows you can no longer see is how someone
 * marks the wrong twenty orders shipped and never finds out which.
 *
 * Orders and products share this. They select the same way and the mistake
 * they protect against is the same one.
 */

export type GroupSelectionState = 'none' | 'some' | 'all';

export function useRowSelection<T extends { id: string }>(rows: T[]) {
  const [picked, setPicked] = useState<ReadonlySet<string>>(() => new Set<string>());

  const selectedIds = useMemo(
    () => rows.map((row) => row.id).filter((id) => picked.has(id)),
    [rows, picked],
  );

  const selectedRows = useMemo(() => rows.filter((row) => picked.has(row.id)), [rows, picked]);

  const toggle = useCallback((id: string) => {
    setPicked((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }, []);

  /**
   * Ticks every id in the group, or clears them all if they were already
   * ticked. Rows outside the group are left exactly as they were, so ticking
   * one category does not quietly untick another.
   */
  const toggleMany = useCallback((ids: string[]) => {
    setPicked((current) => {
      const next = new Set(current);
      const allPicked = ids.length > 0 && ids.every((id) => next.has(id));
      for (const id of ids) {
        if (allPicked) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setPicked((current) => {
      const allPicked = rows.length > 0 && rows.every((row) => current.has(row.id));
      return allPicked ? new Set<string>() : new Set(rows.map((row) => row.id));
    });
  }, [rows]);

  const clear = useCallback(() => setPicked(new Set<string>()), []);

  const groupState = useCallback(
    (ids: string[]): GroupSelectionState => {
      const count = ids.filter((id) => picked.has(id)).length;
      if (count === 0) return 'none';
      return count === ids.length ? 'all' : 'some';
    },
    [picked],
  );

  return {
    selectedIds,
    selectedRows,
    isSelected: useCallback((id: string) => picked.has(id), [picked]),
    toggle,
    toggleMany,
    toggleAll,
    clear,
    groupState,
    areAllSelected: rows.length > 0 && selectedIds.length === rows.length,
    areSomeSelected: selectedIds.length > 0 && selectedIds.length < rows.length,
  };
}
