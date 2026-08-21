import { Clock, MapPin, Store, Wrench } from "lucide-react";

/**
 * Direction A — spec-sheet readout replacing the generic trust bar.
 * Rows read like a data table (key / value / note) in mono type. Claims are
 * Alan's, kept as stated (see project-homepage-redesign memory).
 */
const SPECS = [
  { icon: Clock, code: "SVC-01", label: "17 years in the game", note: "Serving Dublin players since day one" },
  { icon: Store, code: "LOC-01", label: "Oldest airsoft shop in Dublin", note: "Still here, still independent" },
  { icon: MapPin, code: "POS-01", label: "Only walk-in store in north Dublin", note: "Swords, Co. Dublin" },
  { icon: Wrench, code: "REP-01", label: "In-house repairs & servicing", note: "Fixed by the people who sell it" },
];

export function SpecStrip() {
  return (
    <section className="bg-[#0f100c] border-y border-[#e9e7dc]/10 text-[#e9e7dc]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between font-mono text-[10px] tracking-[0.25em] uppercase text-[#9a9a86]">
        <span>// Standard issue</span>
        <span className="text-[#ff5a1f]">Field-verified</span>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-[#e9e7dc]/10">
        {SPECS.map((spec, i) => {
          const Icon = spec.icon;
          return (
            <div
              key={spec.code}
              className={`relative p-6 md:p-8 border-[#e9e7dc]/10 ${i < 3 ? "border-b lg:border-b-0 lg:border-r" : ""} ${i === 0 ? "md:border-r" : ""} ${i === 2 ? "md:border-r-0 lg:border-r" : ""} ${i < 2 ? "md:border-b lg:border-b-0" : ""}`}
            >
              <div className="flex items-center justify-between mb-6">
                <Icon className="w-6 h-6 text-[#ff5a1f]" strokeWidth={1.5} />
                <span className="font-mono text-[10px] tracking-[0.2em] text-[#6f6f5e]">
                  {spec.code}
                </span>
              </div>
              <p className="font-sans font-bold text-base leading-snug mb-2">
                {spec.label}
              </p>
              <p className="font-mono text-xs text-[#9a9a86] leading-relaxed">
                {spec.note}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
