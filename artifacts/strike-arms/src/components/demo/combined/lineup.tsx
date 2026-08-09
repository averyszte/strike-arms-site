import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

/**
 * Combined homepage — "Recommended setups". Replaces the live
 * AnnotatedRifleSection and its invented "SSP-18" product (catalogue is blocked
 * on Alan's real list). Links point only to guides. Drop's big index numbers,
 * kept on the site's dark tokens with an asymmetric middle card.
 */
const PICKS = [
  { n: "01", title: "Your first gun", copy: "Where to start without wasting money.", img: "/images/loadout-beginner.png", href: "/guides/first-airsoft-gun" },
  { n: "02", title: "The CQB build", copy: "Fast, compact, indoor-ready.", img: "/images/loadout-cqb.png", href: "/guides/loadout-cqb" },
  { n: "03", title: "Woodland loadout", copy: "Range and reach for the outdoors.", img: "/images/loadout-outdoor.png", href: "/guides/loadout-woodland" },
];

export function Lineup() {
  return (
    <section className="py-16 md:py-24 bg-card border-y border-border/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 md:mb-14 gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-3">
              Where to start
            </p>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.9]">
              Recommended
              <br />
              setups
            </h2>
          </div>
          <p className="text-base text-muted-foreground max-w-sm md:text-right">
            Not a bestseller list — the setups we actually recommend when you
            walk in and ask.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {PICKS.map((pick, i) => (
            <Link
              key={pick.n}
              href={pick.href}
              className={`group flex flex-col ${i === 1 ? "md:mt-10" : ""}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-background">
                <img
                  src={pick.img}
                  alt={pick.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
                <span className="absolute top-1 left-4 font-black text-7xl md:text-8xl text-foreground leading-none mix-blend-difference">
                  {pick.n}
                </span>
              </div>
              <div className="flex items-start justify-between pt-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground leading-none group-hover:text-accent transition-colors">
                    {pick.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{pick.copy}</p>
                </div>
                <ArrowUpRight className="w-6 h-6 shrink-0 mt-1 text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
