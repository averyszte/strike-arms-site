import { useEffect, useRef, useState } from 'react';

/**
 * Whether the element behind the returned ref is in or near the viewport.
 * Used to stop a marquee's animation while it is scrolled out of sight
 * (N-032). Starts true, so content is never held still before the first
 * observation, and stays true where IntersectionObserver is missing.
 */
export function useIsOnScreen<T extends Element>(rootMargin = '200px') {
  const ref = useRef<T>(null);
  const [isOnScreen, setIsOnScreen] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsOnScreen(entry?.isIntersecting ?? true),
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, isOnScreen };
}
