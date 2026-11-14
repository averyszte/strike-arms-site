import { useEffect, type RefObject } from 'react';

/** Focuses `inputRef` after `delayMs` while `isEnabled` is true. */
export function useDelayedFocus(
  inputRef: RefObject<HTMLInputElement | null>,
  isEnabled: boolean,
  delayMs: number,
) {
  useEffect(() => {
    if (!isEnabled) return undefined;
    const id = setTimeout(() => inputRef.current?.focus(), delayMs);
    return () => clearTimeout(id);
  }, [inputRef, isEnabled, delayMs]);
}
