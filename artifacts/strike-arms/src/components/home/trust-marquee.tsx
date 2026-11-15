import { useState } from "react";
import { Asterisk } from "lucide-react";

import { MarqueePauseButton } from "@/components/marquee-pause-button";
import { TRUST_CLAIMS } from "@/lib/trust-claims";

/**
 * Combined homepage — a marquee of Alan's real claims, replacing the static
 * TrustStrip badges. Drop energy at ~70%: heavy uppercase type and Asterisk
 * separators (like the Drop demo's band), kept on the site's own tokens with an
 * orange stripe. Uses the existing `animate-marquee` keyframe. Claims as Alan
 * stated them (lib/trust-claims.ts).
 *
 * Screen readers get the claims once, as a list; the moving copies are hidden
 * from them. It can be paused, and stands still for reduced motion.
 */
export function TrustMarquee() {
  const [isPaused, setIsPaused] = useState(false);
  const loop = [...TRUST_CLAIMS, ...TRUST_CLAIMS, ...TRUST_CLAIMS];

  return (
    <div className="relative overflow-hidden bg-accent text-accent-foreground py-3.5 md:py-4" data-paused={isPaused}>
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
      <MarqueePauseButton
        isPaused={isPaused}
        onToggle={() => setIsPaused((p) => !p)}
        label="shop claims"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-accent text-accent-foreground hover:text-background"
      />
    </div>
  );
}
