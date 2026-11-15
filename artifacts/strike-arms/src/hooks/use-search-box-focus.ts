import { useCallback, useEffect, useRef, type FocusEvent, type RefObject } from 'react';

/** Lets a mousedown on a result land before blur closes the panel. */
const BLUR_CLOSE_DELAY_MS = 150;

/**
 * Focus and blur for the header search box. Blur closes the panel after a
 * short delay; focusing again cancels that close, so Shift+Tab out and
 * straight back in keeps the panel open. The pending close is also cancelled
 * on unmount, for example when the mobile drawer shuts.
 */
export function useSearchBoxFocus(
  containerRef: RefObject<HTMLElement | null>,
  onFocusIn: () => void,
  dismiss: () => void,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);
  useEffect(() => cancelClose, [cancelClose]);

  const handleFocus = () => {
    cancelClose();
    onFocusIn();
  };

  // Set on the whole search box, so focus moving between the input and the
  // panel's buttons (by Tab) keeps it open, and leaving both closes it.
  const handleBlur = (e: FocusEvent<HTMLElement>) => {
    const next = e.relatedTarget;
    if (next instanceof Node && containerRef.current?.contains(next)) return;
    cancelClose();
    timerRef.current = setTimeout(dismiss, BLUR_CLOSE_DELAY_MS);
  };

  return { handleFocus, handleBlur };
}
