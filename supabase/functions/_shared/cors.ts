import { optionalEnv } from "./env.ts";

/**
 * Two different CORS postures, because the functions have two different
 * kinds of caller. Mixing them up is the usual way a checkout endpoint ends
 * up callable from anywhere.
 *
 * Browser origins come from the ALLOWED_ORIGINS secret (M-014), a
 * comma-separated list such as
 * "https://strikearms.ie,https://www.strikearms.ie". The SITE_URL origin is
 * always allowed. Localhost is allowed only when SITE_URL itself is
 * localhost (the local stack); a localhost entry in ALLOWED_ORIGINS is
 * ignored everywhere else.
 *
 * If ALLOWED_ORIGINS is not set yet, the live origins below are used, so
 * deploying this before the secret exists does not lock the site out of
 * every function. A warning is logged so the gap shows in the logs.
 */

const FALLBACK_ORIGINS = [
  "https://strikearms.ie",
  "https://www.strikearms.ie",
  // Cloudflare Pages origin, live until the apex domain is cut over.
  "https://strike-arms-site.pages.dev",
];

const LOCAL_DEV_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];

const ALLOW_HEADERS = "authorization, x-client-info, apikey, content-type";

function originOf(value: string): string | null {
  try {
    return new URL(value.trim()).origin.toLowerCase();
  } catch {
    return null;
  }
}

function isLocalOrigin(origin: string): boolean {
  const { hostname } = new URL(origin);
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

let allowedOrigins: Set<string> | null = null;

function loadAllowedOrigins(): Set<string> {
  const configured = optionalEnv("ALLOWED_ORIGINS");
  if (!configured) {
    console.error("ALLOWED_ORIGINS is not set; using the built-in live origins");
  }
  const listed = configured ? configured.split(",") : FALLBACK_ORIGINS;
  const siteOrigin = originOf(optionalEnv("SITE_URL") ?? "");
  const isLocalSite = siteOrigin !== null && isLocalOrigin(siteOrigin);

  const origins = new Set<string>();
  for (const entry of [...listed, ...(siteOrigin ? [siteOrigin] : [])]) {
    const origin = originOf(entry);
    if (origin && origin !== "null" && (isLocalSite || !isLocalOrigin(origin))) origins.add(origin);
  }
  if (isLocalSite) LOCAL_DEV_ORIGINS.forEach((origin) => origins.add(origin));
  return origins;
}

function allowed(): Set<string> {
  allowedOrigins ??= loadAllowedOrigins();
  return allowedOrigins;
}

/** The origin an unlisted caller is answered with: one of ours, so the browser blocks the read. */
function defaultOrigin(): string {
  const [first] = allowed();
  return first ?? FALLBACK_ORIGINS[0];
}

/**
 * Server-to-server only. Stripe and pg_cron call these directly, so there is
 * no browser origin and no preflight that matters.
 */
export const webhookCorsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": ALLOW_HEADERS,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/** Whether a browser origin may call the browser-facing functions. */
export function isAllowedOrigin(origin: string | null): boolean {
  return origin !== null && allowed().has(origin.toLowerCase());
}

/**
 * Browser-facing endpoints. An unlisted origin still gets a header (so the
 * response is well formed) but it names one of our own origins, so the
 * browser blocks the read.
 */
export function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get("origin");
  return {
    "Access-Control-Allow-Origin": origin && isAllowedOrigin(origin) ? origin : defaultOrigin(),
    "Access-Control-Allow-Headers": ALLOW_HEADERS,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

/** JSON response helper that never forgets the CORS headers. */
export function jsonResponse(
  body: unknown,
  status: number,
  headers: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
