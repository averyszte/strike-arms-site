import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import { requireEnv } from "./env.ts";

/**
 * Clients that act as someone other than the service role (M-064). One copy,
 * so the session options cannot drift between functions.
 */

const NO_SESSION = { persistSession: false, autoRefreshToken: false };

/** The bearer token of a request, or "" when there is none. */
export function bearerToken(req: Request): string {
  return (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
}

/**
 * Runs as the caller, with their own Authorization header, so RLS and
 * functions such as is_admin_aal2() see their session and its assurance
 * level. `authorization` is the whole header value ("Bearer ...").
 */
export function createCallerClient(authorization: string): SupabaseClient {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_ANON_KEY"), {
    global: { headers: { Authorization: authorization } },
    auth: NO_SESSION,
  });
}

/**
 * An anon client with no stored session, for a one-off Auth call such as
 * re-checking a password. Nothing it signs in to outlives the request.
 */
export function createThrowawayAuthClient(): SupabaseClient {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_ANON_KEY"), {
    auth: NO_SESSION,
  });
}
