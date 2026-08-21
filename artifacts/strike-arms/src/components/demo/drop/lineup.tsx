import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

/**
 * Direction B — "The Lineup" (Alan's picks). Inverted light section for stark
 * contrast against the black hero. Big index numbers, asymmetric cards. Links
 * point to guides only — no invented products (catalogue blocked on Alan).
 */
const PICKS = [
  { n: "01", title: "Your first gun", copy: "Where to start without wasting money", img: "/images/loadout-beginner.png", href: "/guides/first-airsoft-gun" },
  { n: "02", title: "The CQB build", copy: "Fast, compact, indoor-ready", img: "/images/loadout-cqb.png", href: "/guides/loadout-cqb" },
  { n: "03", title: "Woodland loadout", copy: "Range and reach for the outdoors", img: "/images/loadout-outdoor.png", href: "/guides/loadout-woodland" },
];

export function Lineup() {
  return (
    <section className="bg-[#f5f1ea] text-[#0a0a0a] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <h2 className="font-sans font-black uppercase text-4xl md:text-6xl leading-[0.9] tracking-tight">
            Alan's
            <br />
            lineup
          </h2>
          <p className="font-sans text-base text-[#4a4a45] max-w-sm md:text-right">
            Not a bestseller list — the setups Alan actually recommends when you
            walk in and ask.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PICKS.map((pick, i) => (
            <Link
              key={pick.n}
              href={pick.href}
              className={`group relative flex flex-col ${i === 1 ? "md:mt-12" : ""}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[#0a0a0a]">
                <img
                  src={pick.img}
                  alt={pick.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-3 left-4 font-sans font-black text-6xl text-[#f5f1ea] mix-blend-difference leading-none">
                  {pick.n}
                </span>
              </div>
              <div className="flex items-start justify-between pt-4">
                <div>
                  <h3 className="font-sans font-black uppercase text-xl tracking-tight">
                    {pick.title}
                  </h3>
                  <p className="font-sans text-sm text-[#4a4a45] mt-1">{pick.copy}</p>
                </div>
                <ArrowUpRight className="w-6 h-6 shrink-0 mt-1 group-hover:text-[#ff5a1f] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
