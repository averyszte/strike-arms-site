/**
 * Google Tag Manager container (it carries the GA4 tags). The container ID
 * is public (it ships in every page that loads it), so it lives here rather
 * than in an env file. While it is empty, no consent banner shows and
 * nothing is loaded.
 */
export const GTM_CONTAINER_ID = '';

export const IS_ANALYTICS_CONFIGURED = /^GTM-[A-Z0-9]+$/.test(GTM_CONTAINER_ID);

/** Staff, account and checkout pages are not counted. */
const UNTRACKED_PREFIXES = ['/admin', '/account', '/checkout'];

export function shouldTrackPath(path: string): boolean {
  return !UNTRACKED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}
