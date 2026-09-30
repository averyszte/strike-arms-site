import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeadersFor, jsonResponse } from "../_shared/cors.ts";
import { requireEnv } from "../_shared/env.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";

/**
 * A customer deleting their own account, from /account/details (GDPR right
 * to erasure).
 *
 * The gateway checks the JWT (verify_jwt = true); this then:
 *   1. reads the user from that token, never from the body;
 *   2. checks the password again, so a session left open on a shared
 *      computer cannot delete the account;
 *   3. refuses admin accounts, which are removed by the owner, not here;
 *   4. deletes the auth user. 034 cascades that to customer_profiles and sets
 *      orders.user_id to null: the orders stay, because the shop has to keep
 *      sales records, but they are no longer tied to an account.
 *
 * A wrong password is a 200 with deleted: false, so the page can say so
 * without treating it as a failure of the function.
 */

const WRONG_PASSWORD = { deleted: false, reason: "wrong_password" } as const;

class RefusedError extends Error {}

function bearerToken(req: Request): string {
  return (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
}

function readPassword(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const { password } = body as Record<string, unknown>;
  return typeof password === "string" && password.length > 0 && password.length <= 256 ? password : null;
}

/** Signs in with a throwaway client; the account is deleted straight after. */
async function isPasswordRight(email: string, password: string): Promise<boolean> {
  const checker = createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await checker.auth.signInWithPassword({ email, password });
  return !error;
}

async function deleteAccount(req: Request, password: string) {
  const admin = createAdminClient();

  const { data, error } = await admin.auth.getUser(bearerToken(req));
  if (error || !data.user?.email) throw new RefusedError("No signed-in account.");
  const user = data.user;

  if (!(await isPasswordRight(user.email as string, password))) return WRONG_PASSWORD;

  const { data: adminRow, error: adminError } = await admin
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (adminError) throw new Error(`Could not check the account: ${adminError.message}`);
  if (adminRow) throw new RefusedError("Admin accounts cannot be deleted from the storefront.");

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
    if (error instanceof RefusedError) return jsonResponse({ error: error.message }, 403, cors);
    console.error("delete-account failed", error);
    return jsonResponse({ error: "Could not delete the account" }, 500, cors);
  }
});
