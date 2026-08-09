import { Star } from "lucide-react";

/**
 * Direction A — reviews reframed as "field reports". Real review text reused
 * from the live ReviewsSection (not invented). The exact Google count is left
 * off per the validation report's note about hardcoding it.
 */
const REPORTS = [
  { text: "Alan really knows his stuff. Helped me choose my first AEG and I have had zero regrets.", author: "Mark D.", stars: 5 },
  { text: "Best airsoft shop in Dublin, hands down. Fair prices and the advice is worth the visit alone.", author: "Conor M.", stars: 5 },
  { text: "Fixed my rifle fast and cheaply. Would not go anywhere else for repairs.", author: "David K.", stars: 4 },
  { text: "Great selection, honest advice, and never any pressure to overspend.", author: "Aoife B.", stars: 5 },
];

export function FieldReports() {
  return (
    <section className="bg-[#0f100c] border-y border-[#e9e7dc]/10 text-[#e9e7dc] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10 border-b border-[#e9e7dc]/10 pb-6">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#ff5a1f] mb-3">
              04 — Field reports
            </p>
            <h2 className="font-sans font-black uppercase text-3xl md:text-5xl tracking-tight">
              From the players
            </h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-[#9a9a86]">
            <span className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < 4 ? "fill-[#ff5a1f] text-[#ff5a1f]" : "text-[#6f6f5e]"}`} />
              ))}
            </span>
            <span>4.7 / 5 · Google</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#e9e7dc]/10 border border-[#e9e7dc]/10">
          {REPORTS.map((r, i) => (
            <figure key={r.author} className="bg-[#0f100c] p-8 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="flex">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s < r.stars ? "fill-[#ff5a1f] text-[#ff5a1f]" : "text-[#6f6f5e]"}`} />
                  ))}
                </span>
                <span className="font-mono text-[10px] tracking-[0.2em] text-[#6f6f5e]">
                  RPT-0{i + 1}
                </span>
              </div>
              <blockquote className="font-sans text-lg leading-snug flex-1">
                {r.text}
              </blockquote>
              <figcaption className="mt-6 font-mono text-xs tracking-[0.2em] uppercase text-[#9a9a86]">
                — {r.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
