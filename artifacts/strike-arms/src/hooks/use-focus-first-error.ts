import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

/**
 * After a submit that found errors, move focus to the first field marked
 * `aria-invalid="true"` in the form and bring it to the middle of the screen
 * (N-049). The errors are state, so the attribute only exists after the next
 * render; the effect waits for that render rather than querying straight away.
 *
 * Call `reportErrors(count)` from the submit handler with the number found.
 */
export function useFocusFirstError(formRef: RefObject<HTMLFormElement | null>) {
  const [attempt, setAttempt] = useState(0);
  const pendingRef = useRef(false);

  useEffect(() => {
    if (!pendingRef.current) return;
    pendingRef.current = false;
    const field = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!field) return;
    field.focus({ preventScroll: true });
    field.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [attempt, formRef]);

  return useCallback((count: number) => {
    if (count === 0) return;
    pendingRef.current = true;
    setAttempt((n) => n + 1);
  }, []);
}
