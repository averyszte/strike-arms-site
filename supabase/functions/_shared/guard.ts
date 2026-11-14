import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { RATE_LIMITED_MESSAGE, type RateLimit, withinRateLimits } from "./rate-limit.ts";
import { verifyTurnstile } from "./turnstile.ts";

/**
 * The bot check and rate limits for a public form, in the order that stops a
 * tokenless script from using up anyone else's allowance (M-004):
 *
 *   1. `beforeToken` limits: per-address buckets. Counted first, so a flood
 *      without tokens from one address is still stopped, and it only uses up
 *      that address's own allowance.
 *   2. Turnstile.
 *   3. `afterToken` limits: shop-wide and per-email (or per-order) buckets.
 *      Counted only once a token has passed, so a script with no tokens
 *      cannot shut a form for everyone, or lock out a customer's email.
 */

export type GuardRefusal = { status: number; error: string; code?: string };

export type GuardPlan = {
  /** The Turnstile action the page rendered the widget with. */
  action: string;
  token: string | null;
  remoteIp: string | null;
  beforeToken: RateLimit[];
  afterToken: RateLimit[];
};

const RATE_LIMITED: GuardRefusal = {
  status: 429,
  error: RATE_LIMITED_MESSAGE,
  code: "rate_limited",
};

/** Null when the request may go ahead; otherwise what to answer with. */
export async function guardPublicRequest(
  admin: SupabaseClient,
  plan: GuardPlan,
): Promise<GuardRefusal | null> {
  if (plan.beforeToken.length > 0 && !(await withinRateLimits(admin, plan.beforeToken))) {
    return RATE_LIMITED;
  }

  const check = await verifyTurnstile(plan.token, plan.action, plan.remoteIp);
  if (!check.ok) return { status: check.status, error: check.error, code: check.code };

  if (plan.afterToken.length > 0 && !(await withinRateLimits(admin, plan.afterToken))) {
    return RATE_LIMITED;
  }
  return null;
}
