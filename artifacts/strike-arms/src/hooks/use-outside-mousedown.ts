import { useEffect, type RefObject } from 'react';

/**
 * Calls `onOutside` when a mousedown lands outside `containerRef`, but only
 * while `isActive` is true, so no listener is attached when nothing is open.
 */
export function useOutsideMousedown(
  containerRef: RefObject<HTMLElement | null>,
  isActive: boolean,
  onOutside: () => void,
) {
  useEffect(() => {
    if (!isActive) return;
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onOutside();
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [containerRef, isActive, onOutside]);
}
