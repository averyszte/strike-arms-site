import { requireEnv } from "./env.ts";

/**
 * Whether a request carries the service-role key, for the maintenance
 * functions that only cron may call (sweep-orphan-images,
 * notification-worker). The gateway checks the JWT first; this makes sure
 * it is the service role and not any signed-in user.
 */

/**
 * Constant-time-ish comparison. The service-role key is a bearer secret, and
 * an early-exit compare on a secret is a side channel, even if a remote timing
 * attack over an Edge Function is a stretch.
 */
function secretsMatch(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function isServiceRoleCaller(req: Request): boolean {
  const header = req.headers.get("authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;
  return secretsMatch(token, requireEnv("SUPABASE_SERVICE_ROLE_KEY"));
}
