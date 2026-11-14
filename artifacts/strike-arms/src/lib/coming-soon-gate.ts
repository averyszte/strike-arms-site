/**
 * The holding page shown on the live domain until launch (2026-10-25).
 * The pages.dev address and localhost stay open, so the site can still be
 * checked, and /admin stays open on every host so Alan can keep working.
 *
 * To launch: set IS_COMING_SOON to false and deploy.
 */
export const IS_COMING_SOON = false;

const GATED_HOSTS = new Set(["strikearms.ie", "www.strikearms.ie"]);

/**
 * Paths that work behind the holding page: the admin and its sign-in links,
 * the Stripe return page (a payment must still be confirmed), and the links
 * in customer emails (account confirm, reset and email change). The cart and checkout stay
 * gated, so no new order can start until launch.
 */
const OPEN_PATH_PREFIXES = [
  "/admin",
  "/auth/confirm",
  "/checkout/success",
  "/account/confirm",
  "/account/reset",
  "/account/details",
];

/** Open only as exactly this path: /account holds the guest order lookup. */
const OPEN_EXACT_PATHS = new Set(["/account"]);

function isOpenPath(pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (OPEN_EXACT_PATHS.has(path)) return true;
  return OPEN_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/** Visiting any page with this query string opens the full site on this browser. */
export const PREVIEW_PARAM = "preview";

export function shouldShowComingSoon(
  hostname: string,
  pathname: string,
  hasPreviewPass: boolean,
): boolean {
  if (!IS_COMING_SOON || hasPreviewPass) return false;
  if (!GATED_HOSTS.has(hostname)) return false;
  return !isOpenPath(pathname);
}
