/**
 * The caller's address, as Supabase's gateway reports it: the first entry of
 * x-forwarded-for. Used for the per-address rate limits and as a hint to
 * Turnstile. It is only as good as the gateway, so no limit relies on it
 * alone: each function also counts per order or per checkout attempt.
 */
export function clientIp(req: Request): string | null {
  const first = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return first || req.headers.get("cf-connecting-ip") || null;
}
