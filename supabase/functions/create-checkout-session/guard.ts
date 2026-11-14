import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { clientIp } from "../_shared/client-ip.ts";
import { type GuardRefusal, guardPublicRequest } from "../_shared/guard.ts";
import type { RateLimit } from "../_shared/rate-limit.ts";

/**
 * Bot protection for checkout (Phase 2 item 17). Every call writes a pending
 * order and opens a Stripe session, so unchecked calls could flood both.
 * Runs after the body is parsed and before the order is created.
 *
 * guardPublicRequest keeps the order that M-004 needs: the per-attempt and
 * per-address counters first, then Turnstile, then the shop-wide counter only
 * for a request with a valid token, so a script with no token cannot use up
 * the hour and shut checkout for everyone.
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

export type { GuardRefusal };

const SHOP_WIDE_LIMIT: RateLimit = {
  scope: "checkout:all",
  value: "all",
  max: SHOP_WIDE_PER_HOUR,
  windowSeconds: HOUR,
};

function callerLimits(ip: string | null, attemptId: string): RateLimit[] {
  const limits: RateLimit[] = [
    { scope: "checkout:attempt", value: attemptId, max: 5, windowSeconds: TEN_MINUTES },
  ];
  if (ip) limits.push({ scope: "checkout:ip", value: ip, max: 20, windowSeconds: HOUR });
  return limits;
}

/** Null when the request may go ahead; otherwise what to answer with. */
export function guardCheckout(
  admin: SupabaseClient,
  req: Request,
  attemptId: string,
  turnstileToken: string | null,
): Promise<GuardRefusal | null> {
  const ip = clientIp(req);
  return guardPublicRequest(admin, {
    action: TURNSTILE_ACTION,
    token: turnstileToken,
    remoteIp: ip,
    beforeToken: callerLimits(ip, attemptId),
    afterToken: [SHOP_WIDE_LIMIT],
  });
}
