import { Asterisk } from "lucide-react";

/**
 * Combined homepage — a marquee of Alan's real claims, replacing the static
 * TrustStrip badges. Drop energy at ~70%: heavy uppercase type and Asterisk
 * separators (like the Drop demo's band), kept on the site's own tokens with an
 * orange stripe. Uses the existing `animate-marquee` keyframe. Claims as Alan
 * stated them.
 */
const CLAIMS = [
  "17 years in the game",
  "Oldest airsoft shop in Dublin",
  "Walk-in store in Swords",
  "In-house repairs & servicing",
];

export function TrustMarquee() {
  const loop = [...CLAIMS, ...CLAIMS, ...CLAIMS];

  return (
    <div className="overflow-hidden bg-accent text-accent-foreground py-3.5 md:py-4">
      <div className="flex whitespace-nowrap animate-marquee">
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
