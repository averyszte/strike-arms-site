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

/** The unverified `role` claim of a JWT, or null if it is not one. */
function jwtRole(token: string): string | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims: unknown = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
    if (typeof claims !== "object" || claims === null || !("role" in claims)) return null;
    return typeof claims.role === "string" ? claims.role : null;
  } catch {
    return null;
  }
}

/**
 * The function's own SUPABASE_SERVICE_ROLE_KEY need not be byte-identical to
 * the key cron holds in Vault (projects on the new API keys inject a
 * different one), so a token claiming the service role is also accepted once
 * Auth confirms it: the admin endpoint verifies the signature itself and
 * answers 200 only to the service role.
 */
async function authConfirmsServiceRole(token: string): Promise<boolean> {
  if (jwtRole(token) !== "service_role") return false;
  const res = await fetch(`${requireEnv("SUPABASE_URL")}/auth/v1/admin/users?per_page=1`, {
    headers: { apikey: token, Authorization: `Bearer ${token}` },
  });
  await res.body?.cancel();
  return res.ok;
}

export async function isServiceRoleCaller(req: Request): Promise<boolean> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;
  if (secretsMatch(token, requireEnv("SUPABASE_SERVICE_ROLE_KEY"))) return true;
  return await authConfirmsServiceRole(token);
}
