/**
 * Google Analytics 4. The measurement ID is public (it ships in every page
 * that loads the tag), so it lives here rather than in an env file.
 * While it is empty, no consent banner shows and nothing is loaded.
 */
export const GA4_MEASUREMENT_ID = '';

export const IS_ANALYTICS_CONFIGURED = /^G-[A-Z0-9]+$/.test(GA4_MEASUREMENT_ID);

/** Staff, account and checkout pages are not counted. */
const UNTRACKED_PREFIXES = ['/admin', '/account', '/checkout'];

export function shouldTrackPath(path: string): boolean {
  return !UNTRACKED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}
