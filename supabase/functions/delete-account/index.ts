import { clientIp } from "../_shared/client-ip.ts";
import { corsHeadersFor, jsonResponse } from "../_shared/cors.ts";
import { RATE_LIMITED_MESSAGE, type RateLimit, withinRateLimits } from "../_shared/rate-limit.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { bearerToken, createThrowawayAuthClient } from "../_shared/supabase-caller.ts";

/**
 * A customer deleting their own account, from /account/details (GDPR right
 * to erasure).
 *
 * The gateway checks the JWT (verify_jwt = true); this then (M-013):
 *   1. reads the user from that token, never from the body;
 *   2. counts the attempt against a per-account and a per-address limit, so
 *      the password check below cannot be used to guess a password;
 *   3. refuses admin accounts, which are removed by the owner, not here.
 *      This comes before the password check, so an admin's password is
 *      never tested by this endpoint at all;
 *   4. checks the password again, so a session left open on a shared
 *      computer cannot delete the account;
 *   5. deletes the auth user. 034 cascades that to customer_profiles and sets
 *      orders.user_id to null: the orders stay, because the shop has to keep
 *      sales records, but they are no longer tied to an account.
 *
 * There is no Turnstile check: the caller already holds a verified session,
 * and the page sends no token. The per-account limit is the real control.
 *
 * A wrong password is a 200 with deleted: false, so the page can say so
 * without treating it as a failure of the function.
 */

const WRONG_PASSWORD = { deleted: false, reason: "wrong_password" } as const;
const HOUR = 60 * 60;

class RefusedError extends Error {
  readonly status: number;

  constructor(message: string, status = 403) {
    super(message);
    this.status = status;
  }
}

type Admin = ReturnType<typeof createAdminClient>;

function readPassword(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const { password } = body as Record<string, unknown>;
  return typeof password === "string" && password.length > 0 && password.length <= 256 ? password : null;
}

/** Signs in with a throwaway client; the account is deleted straight after. */
async function isPasswordRight(email: string, password: string): Promise<boolean> {
  const { error } = await createThrowawayAuthClient().auth.signInWithPassword({ email, password });
  return !error;
}

function limitsFor(userId: string, ip: string | null): RateLimit[] {
  const limits: RateLimit[] = [
    { scope: "delete-account:user", value: userId, max: 5, windowSeconds: HOUR },
  ];
  if (ip) limits.push({ scope: "delete-account:ip", value: ip, max: 10, windowSeconds: HOUR });
  return limits;
}

async function refuseAdmin(admin: Admin, userId: string): Promise<void> {
  const { data: adminRow, error } = await admin
    .from("admins")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(`Could not check the account: ${error.message}`);
  if (adminRow) throw new RefusedError("Admin accounts cannot be deleted from the storefront.");
}

async function deleteAccount(req: Request, password: string) {
  const admin = createAdminClient();

  const { data, error } = await admin.auth.getUser(bearerToken(req));
  if (error || !data.user?.email) throw new RefusedError("No signed-in account.");
  const user = data.user;

  if (!(await withinRateLimits(admin, limitsFor(user.id, clientIp(req))))) {
    throw new RefusedError(RATE_LIMITED_MESSAGE, 429);
  }

  await refuseAdmin(admin, user.id);

  if (!(await isPasswordRight(user.email as string, password))) return WRONG_PASSWORD;

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) throw new Error(`Could not delete the account: ${deleteError.message}`);
  return { deleted: true };
}

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = corsHeadersFor(req);

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405, cors);

  try {
    const password = readPassword(await req.json().catch(() => null));
    if (!password) return jsonResponse(WRONG_PASSWORD, 200, cors);

    return jsonResponse(await deleteAccount(req, password), 200, cors);
  } catch (error) {
    if (error instanceof RefusedError) return jsonResponse({ error: error.message }, error.status, cors);
    console.error("delete-account failed", error);
    return jsonResponse({ error: "Could not delete the account" }, 500, cors);
  }
});
