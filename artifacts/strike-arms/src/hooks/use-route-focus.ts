import { useEffect, type RefObject } from 'react';
import { useLocation } from 'wouter';

/**
 * The last pathname a page announced, kept outside React because each page
 * mounts its own SiteLayout: a module value survives the remount, so the first
 * page of a visit is left alone and every client-side route change after it
 * is caught.
 */
let lastPathname: string | null = null;

/**
 * Moves keyboard and screen-reader focus to the page's <main> after a
 * client-side route change, so the next Tab starts at the new page rather
 * than somewhere in the old one. The first page load keeps the browser's own
 * focus. A link to an in-page anchor keeps the browser's jump to it.
 */
export function useRouteFocus(mainRef: RefObject<HTMLElement | null>) {
  const [pathname] = useLocation();

  useEffect(() => {
    const previous = lastPathname;
    lastPathname = pathname;
    if (previous === null || previous === pathname) return;
    if (window.location.hash) return;
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, mainRef]);
}
