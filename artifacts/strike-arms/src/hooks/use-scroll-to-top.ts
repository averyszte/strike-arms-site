import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Opens every new page at the top. A client-side route change keeps the old
 * page's scroll position otherwise.
 *
 * Keyed on the pathname only, so changing a shop filter or sort (the query
 * string) leaves the shopper where they are. A link to an in-page anchor keeps
 * the browser's own jump to that anchor.
 */
export function useScrollToTop() {
  const [pathname] = useLocation();

  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
}
