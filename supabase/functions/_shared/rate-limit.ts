import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { requireEnv } from "./env.ts";

/**
 * Fixed-window rate limits, counted in the database by hit_rate_limit()
 * (migration 035), so they hold across every instance of a function.
 *
 * Every key value is run through HMAC-SHA-256 before it is stored, so the
 * table never holds an IP address. A plain hash would not do: there are few
 * enough IPv4 addresses to reverse one by trying them all. The HMAC key is the
 * service-role key, which the functions already hold and nobody outside has.
 * Rotating it just starts the counters again.
 */

export type RateLimit = {
  /** What is being counted, e.g. "checkout:ip". */
  scope: string;
  /** The value counted within the scope, e.g. the address. */
  value: string;
  max: number;
  windowSeconds: number;
};

export const RATE_LIMITED_MESSAGE =
  "Too many attempts. Please wait a few minutes and try again.";

let hmacKey: Promise<CryptoKey> | null = null;

function signingKey(): Promise<CryptoKey> {
  hmacKey ??= crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(requireEnv("SUPABASE_SERVICE_ROLE_KEY")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return hmacKey;
}

async function digest(value: string): Promise<string> {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await signingKey(),
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hit(admin: SupabaseClient, limit: RateLimit): Promise<boolean> {
  const { data, error } = await admin.rpc("hit_rate_limit", {
    p_key: `${limit.scope}:${await digest(limit.value)}`,
    p_max: limit.max,
    p_window_seconds: limit.windowSeconds,
  });

  // Fails closed. If the counter cannot be read, the request is refused
  // rather than let through unlimited.
  if (error) throw new Error(`Rate limit check failed: ${error.message}`);
  return data === true;
}

/**
 * Counts one hit against every limit and says whether all of them still
 * allow the request. Every limit is counted even when an earlier one is
 * already over, so a caller cannot dodge one counter by tripping another.
 */
export async function withinRateLimits(
  admin: SupabaseClient,
  limits: RateLimit[],
): Promise<boolean> {
  const results = await Promise.all(limits.map((limit) => hit(admin, limit)));
  return results.every(Boolean);
}
