import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

/**
 * The customer account a checkout belongs to, if the shopper is signed in.
 *
 * supabase-js sends the session's access token as the bearer when there is
 * one, and the anon key when there is not. Only a token Supabase Auth itself
 * accepts counts; anything else, including the anon key, an expired session
 * or an Auth outage, is a guest checkout. Checkout never fails over this.
 *
 * The id comes from the verified token, never from the request body, so a
 * shopper cannot file an order under someone else's account.
 */
export async function signedInCustomerId(
  admin: SupabaseClient,
  req: Request,
): Promise<string | null> {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  try {
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user || data.user.is_anonymous) return null;
    return data.user.id;
  } catch {
    return null;
  }
}
