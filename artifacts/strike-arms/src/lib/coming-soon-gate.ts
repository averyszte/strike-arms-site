/**
 * The holding page shown on the live domain until launch (2026-10-25).
 * The pages.dev address and localhost stay open, so the site can still be
 * checked, and /admin stays open on every host so Alan can keep working.
 *
 * To launch: set IS_COMING_SOON to false and deploy.
 */
export const IS_COMING_SOON = true;

const GATED_HOSTS = new Set(["strikearms.ie", "www.strikearms.ie"]);

/** Paths that work behind the holding page: the admin and its sign-in links. */
const OPEN_PATH_PREFIXES = ["/admin", "/auth/confirm"];

/** Visiting any page with this query string opens the full site on this browser. */
export const PREVIEW_PARAM = "preview";

export function shouldShowComingSoon(
  hostname: string,
  pathname: string,
  hasPreviewPass: boolean,
): boolean {
  if (!IS_COMING_SOON || hasPreviewPass) return false;
  if (!GATED_HOSTS.has(hostname)) return false;
  return !OPEN_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
