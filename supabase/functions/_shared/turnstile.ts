import { isLocalStack, optionalEnv } from "./env.ts";
import { withinRateLimits } from "./rate-limit.ts";
import { createAdminClient } from "./supabase-admin.ts";

/**
 * Cloudflare Turnstile check for the public functions. Ported from All
 * Blooms, with an action check and a hostname list.
 *
 * Fails closed (M-012):
 *   - no TURNSTILE_SECRET_KEY: every request is refused (503);
 *   - no SITE_HOSTNAME on the hosted project: every request is refused (500),
 *     because without it a token solved on any site using our site key would
 *     pass;
 *   - ALLOW_INSECURE_NO_CAPTCHA=true skips the check only on the local stack
 *     (an http SUPABASE_URL). On the hosted project it is ignored and logged.
 *
 * SITE_HOSTNAME is a comma-separated list, e.g.
 * "strikearms.ie,strike-arms-site.pages.dev". A token counts only if it was
 * solved on one of those hosts or a subdomain of one (www, preview deploys).
 *
 * Every refusal that a visitor caused (no token, a rejected token, the wrong
 * action or host) is counted under TURNSTILE_FAIL_SCOPE through
 * hit_rate_limit. system_health() (048) sums those rows for its
 * turnstile_failures check. Outages and missing secrets are not counted:
 * they are ours, and they show up in the function logs instead.
 */

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const VERIFY_TIMEOUT_MS = 8_000;
const MAX_TOKEN_LENGTH = 2048;

/** Matched exactly by 048: `rate_limit_hits.key like 'turnstile:fail:%'`. */
export const TURNSTILE_FAIL_SCOPE = "turnstile:fail";
const FAIL_COUNT_WINDOW_SECONDS = 60 * 60;
// A tally, not a limit: hit_rate_limit needs a ceiling, and this one is never reached.
const FAIL_COUNT_CEILING = 1_000_000;

export type TurnstileFailureCode =
  | "captcha_missing"
  | "captcha_failed"
  | "captcha_action_mismatch"
  | "captcha_hostname_mismatch"
  | "captcha_unavailable"
  | "captcha_misconfigured";

export type TurnstileResult =
  | { ok: true }
  | { ok: false; status: number; error: string; code: TurnstileFailureCode };

type Failure = Extract<TurnstileResult, { ok: false }>;

const NOT_PASSED = "The bot check did not pass. Please try again.";
const UNAVAILABLE = "This is temporarily unavailable. Please try again later.";

type SiteverifyResponse = {
  success?: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
};

/** The SITE_HOSTNAME list, or null when it is not set. */
function allowedHostnames(): string[] | null {
  const entries = (optionalEnv("SITE_HOSTNAME") ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry !== "");
  return entries.length > 0 ? entries : null;
}

function hostnameAllowed(hostname: string | undefined, allowed: string[] | null): boolean {
  if (!allowed) return true; // local stack only; refused earlier on the hosted project
  if (!hostname) return false;
  const host = hostname.toLowerCase();
  return allowed.some((entry) => host === entry || host.endsWith(`.${entry}`));
}

/** Counts one visitor-caused failure for the health check. Never throws. */
async function countFailure(action: string, code: TurnstileFailureCode): Promise<void> {
  try {
    await withinRateLimits(createAdminClient(), [{
      scope: TURNSTILE_FAIL_SCOPE,
      value: `${action}:${code}`,
      max: FAIL_COUNT_CEILING,
      windowSeconds: FAIL_COUNT_WINDOW_SECONDS,
    }]);
  } catch (error) {
    console.error("could not count a turnstile failure", error);
  }
}

async function refuse(
  action: string,
  code: TurnstileFailureCode,
  status: number,
  error: string,
): Promise<Failure> {
  await countFailure(action, code);
  return { ok: false, status, error, code };
}

/** Why the check cannot run at all, or null when it is configured. */
function configurationProblem(): Failure | null {
  if (!optionalEnv("TURNSTILE_SECRET_KEY")) {
    console.error("TURNSTILE_SECRET_KEY is not set; refusing the request");
    return { ok: false, status: 503, error: UNAVAILABLE, code: "captcha_misconfigured" };
  }
  if (!allowedHostnames() && !isLocalStack()) {
    console.error("SITE_HOSTNAME is not set on the hosted project; refusing the request");
    return { ok: false, status: 500, error: UNAVAILABLE, code: "captcha_misconfigured" };
  }
  return null;
}

/** True only for the local stack with the escape hatch set. */
function isCaptchaSkipped(): boolean {
  if (optionalEnv("ALLOW_INSECURE_NO_CAPTCHA") !== "true") return false;
  if (isLocalStack()) return !optionalEnv("TURNSTILE_SECRET_KEY");
  console.error("ALLOW_INSECURE_NO_CAPTCHA is set on the hosted project; ignoring it");
  return false;
}

async function siteverify(
  secret: string,
  token: string,
  remoteIp: string | null,
): Promise<SiteverifyResponse | null> {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);
  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });
    return await response.json() as SiteverifyResponse;
  } catch (error) {
    console.error("turnstile siteverify unreachable", error);
    return null;
  }
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
  if (isCaptchaSkipped()) return { ok: true };
  const problem = configurationProblem();
  if (problem) return problem;

  if (!token || token.length > MAX_TOKEN_LENGTH) {
    return refuse(action, "captcha_missing", 400, "Please complete the bot check and try again.");
  }

  const data = await siteverify(optionalEnv("TURNSTILE_SECRET_KEY") ?? "", token, remoteIp);
  if (!data) {
    return {
      ok: false,
      status: 503,
      error: "The bot check is not responding. Please try again in a minute.",
      code: "captcha_unavailable",
    };
  }

  if (data.success !== true) {
    console.error("turnstile rejected the token", data["error-codes"]);
    return refuse(action, "captcha_failed", 403, NOT_PASSED);
  }
  if (data.action !== action) {
    console.error(`turnstile action mismatch: expected ${action}, got ${data.action}`);
    return refuse(action, "captcha_action_mismatch", 403, NOT_PASSED);
  }
  if (!hostnameAllowed(data.hostname, allowedHostnames())) {
    console.error(`turnstile hostname not allowed: ${data.hostname}`);
    return refuse(action, "captcha_hostname_mismatch", 403, NOT_PASSED);
  }
  return { ok: true };
}
