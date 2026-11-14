/**
 * The caller's address, for the per-address rate limits and as a hint to
 * Turnstile (M-011).
 *
 * The left-most x-forwarded-for entry is whatever the client sent, so a
 * script could set a new one on every request and never hit a per-address
 * limit. Trusted sources come first instead:
 *   1. cf-connecting-ip, which Cloudflare sets and overwrites at its edge;
 *   2. the right-most x-forwarded-for entry, the hop the gateway itself
 *      appended.
 * Which of these the hosted gateway really fills is confirmed by the echo
 * test in the hosted checklist. No limit relies on the address alone: each
 * function also counts per order, per email or per checkout attempt.
 */

const MAX_IP_LENGTH = 45; // the longest textual IPv6 address
const IP_PATTERN = /^[0-9a-fA-F:.]+$/;

function cleanIp(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.length > MAX_IP_LENGTH || !IP_PATTERN.test(trimmed)) return null;
  return trimmed;
}

function rightMostForwarded(header: string | null): string | null {
  if (!header) return null;
  const hops = header.split(",").map((hop) => hop.trim()).filter((hop) => hop !== "");
  return cleanIp(hops[hops.length - 1]);
}

export function clientIp(req: Request): string | null {
  return cleanIp(req.headers.get("cf-connecting-ip")) ??
    rightMostForwarded(req.headers.get("x-forwarded-for"));
}
