/**
 * Two different CORS postures, because the two functions have two different
 * callers. Mixing them up is the usual way a checkout endpoint ends up
 * callable from anywhere.
 */

const ALLOWED_ORIGINS = new Set([
  "https://strikearms.ie",
  "https://www.strikearms.ie",
  // Cloudflare Pages preview/production origin, live until the apex domain is
  // secured and cut over. Without it the deployed site cannot call checkout.
  "https://strike-arms-site.pages.dev",
  "http://localhost:5173",
]);

const ALLOW_HEADERS = "authorization, x-client-info, apikey, content-type";

/**
 * Server-to-server only. Stripe calls the webhook directly, so there is no
 * browser origin and no preflight that matters.
 */
export const webhookCorsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": ALLOW_HEADERS,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Browser-facing endpoints. An unlisted origin still gets a header (so the
 * response is well formed) but it names the production apex, so the browser
 * blocks the read.
 */
export function corsHeadersFor(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin)
      ? origin
      : "https://strikearms.ie",
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
