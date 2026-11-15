import { Asterisk } from "lucide-react";

import { TRUST_CLAIMS } from "@/lib/trust-claims";

/**
 * Combined homepage — a marquee of Alan's real claims, replacing the static
 * TrustStrip badges. Drop energy at ~70%: heavy uppercase type and Asterisk
 * separators (like the Drop demo's band), kept on the site's own tokens with an
 * orange stripe. Uses the existing `animate-marquee` keyframe. Claims as Alan
 * stated them (lib/trust-claims.ts).
 *
 * Screen readers get the claims once, as a list; the moving copies are hidden
 * from them. It stands still for reduced motion.
 */
export function TrustMarquee() {
  const loop = [...TRUST_CLAIMS, ...TRUST_CLAIMS, ...TRUST_CLAIMS];

  return (
    <div className="relative overflow-hidden bg-accent text-accent-foreground py-3.5 md:py-4">
      <ul className="sr-only">
        {TRUST_CLAIMS.map((claim) => <li key={claim}>{claim}</li>)}
      </ul>
      <div className="flex whitespace-nowrap animate-marquee" aria-hidden="true">
        {loop.map((claim, i) => (
          <span key={i} className="flex items-center">
            <span className="text-sm md:text-base font-black uppercase tracking-tight px-6">
              {claim}
            </span>
            <Asterisk className="w-4 h-4 shrink-0 opacity-70" strokeWidth={2.5} />
          </span>
        ))}
      </div>
    </div>
  );
}
