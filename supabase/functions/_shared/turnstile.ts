import { optionalEnv } from "./env.ts";

/**
 * Cloudflare Turnstile check for the public functions. Ported from All
 * Blooms, with an action check and a hostname list.
 *
 * Fails closed: with no TURNSTILE_SECRET_KEY every request is refused, so a
 * deploy that forgot the secret cannot quietly run without bot protection.
 * ALLOW_INSECURE_NO_CAPTCHA=true skips the check, for the local stack only.
 * Never set it on the hosted project.
 *
 * SITE_HOSTNAME is a comma-separated list, e.g.
 * "strikearms.ie,strike-arms-site.pages.dev". A token counts only if it was
 * solved on one of those hosts or a subdomain of one (www, preview deploys).
 * Without it a token solved on any site using our site key would pass.
 */

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 8_000;
const MAX_TOKEN_LENGTH = 2048;

export type TurnstileResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

const FAILED: TurnstileResult = {
  ok: false,
  status: 403,
  error: "The bot check did not pass. Please try again.",
};

type SiteverifyResponse = {
  success?: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
};

function hostnameAllowed(hostname: string | undefined): boolean {
  const allowed = optionalEnv("SITE_HOSTNAME");
  if (!allowed) return true;
  if (!hostname) return false;

  const host = hostname.toLowerCase();
  return allowed
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry !== "")
    .some((entry) => host === entry || host.endsWith(`.${entry}`));
}

/**
 * Checks a token from the widget. `action` must match the one the page
 * rendered the widget with, so a token solved for one form cannot be spent
 * on another.
 */
export async function verifyTurnstile(
  token: string | null,
  action: string,
  remoteIp: string | null,
): Promise<TurnstileResult> {
  const secret = optionalEnv("TURNSTILE_SECRET_KEY");

  if (!secret) {
    if (optionalEnv("ALLOW_INSECURE_NO_CAPTCHA") === "true") return { ok: true };
    console.error("TURNSTILE_SECRET_KEY is not set; refusing the request");
    return {
      ok: false,
      status: 503,
      error: "This is temporarily unavailable. Please try again later.",
    };
  }

  if (!token || token.length > MAX_TOKEN_LENGTH) {
    return { ok: false, status: 400, error: "Please complete the bot check and try again." };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  let data: SiteverifyResponse;
  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });
    data = await response.json() as SiteverifyResponse;
  } catch (error) {
    console.error("turnstile siteverify unreachable", error);
    return {
      ok: false,
      status: 503,
      error: "The bot check is not responding. Please try again in a minute.",
    };
  }

  if (data.success !== true) {
    console.error("turnstile rejected the token", data["error-codes"]);
    return FAILED;
  }
  if (data.action !== action) {
    console.error(`turnstile action mismatch: expected ${action}, got ${data.action}`);
    return FAILED;
  }
  if (!hostnameAllowed(data.hostname)) {
    console.error(`turnstile hostname not allowed: ${data.hostname}`);
    return FAILED;
  }
  return { ok: true };
}
