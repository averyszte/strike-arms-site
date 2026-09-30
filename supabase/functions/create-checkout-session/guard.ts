import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { clientIp } from "../_shared/client-ip.ts";
import { RATE_LIMITED_MESSAGE, type RateLimit, withinRateLimits } from "../_shared/rate-limit.ts";
import { verifyTurnstile } from "../_shared/turnstile.ts";

/**
 * Bot protection for checkout (Phase 2 item 17). Every call holds stock for
 * 35 minutes, so unchecked calls could hold the whole shop without anyone
 * paying. Runs after the body is parsed and before anything is reserved.
 *
 * The limits are generous for a person: a shopper who retries a few times,
 * or a household behind one address, stays well inside them.
 */

const HOUR = 60 * 60;
const TEN_MINUTES = 10 * 60;

// The whole shop, from everyone. A backstop in case the per-address limit is
// dodged; far above what the shop sees in an hour.
const SHOP_WIDE_PER_HOUR = 200;

export const TURNSTILE_ACTION = "checkout";

export type GuardRefusal = { status: number; error: string };

function limitsFor(ip: string | null, attemptId: string): RateLimit[] {
  const limits: RateLimit[] = [
    { scope: "checkout:attempt", value: attemptId, max: 5, windowSeconds: TEN_MINUTES },
    { scope: "checkout:all", value: "all", max: SHOP_WIDE_PER_HOUR, windowSeconds: HOUR },
  ];
  if (ip) limits.push({ scope: "checkout:ip", value: ip, max: 20, windowSeconds: HOUR });
  return limits;
}

/** Null when the request may go ahead; otherwise what to answer with. */
export async function guardCheckout(
  admin: SupabaseClient,
  req: Request,
  attemptId: string,
  turnstileToken: string | null,
): Promise<GuardRefusal | null> {
  const ip = clientIp(req);

  if (!(await withinRateLimits(admin, limitsFor(ip, attemptId)))) {
    return { status: 429, error: RATE_LIMITED_MESSAGE };
  }

  const check = await verifyTurnstile(turnstileToken, TURNSTILE_ACTION, ip);
  return check.ok ? null : { status: check.status, error: check.error };
}
