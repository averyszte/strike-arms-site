import { Link } from "wouter";
import { Users, Shield, Tag, Headphones, ArrowRight } from "lucide-react";

/**
 * Combined homepage — "Why Strike Arms". Merges the live WhyBuySection (four
 * reasons) with ExpertGuidanceSection's contact CTAs into one section, cutting
 * the message repetition that made the live page feel padded. Site tokens.
 */
const REASONS = [
  { icon: Users, title: "Expert gear advice", copy: "We've tested what we sell. Real recommendations from people who actually play." },
  { icon: Shield, title: "Beginner-friendly", copy: "New to airsoft? We'll walk you through what you need — and nothing you don't." },
  { icon: Tag, title: "Fair pricing", copy: "No inflated markups. Competitive prices on quality gear and replicas." },
  { icon: Headphones, title: "After-sale support", copy: "Issue after purchase? Need an upgrade installed? We're here to help." },
];

export function WhyStrikeArms() {
  return (
    <section className="bg-background border-y border-border/60">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Image — the raw store photo is bright and clashes with the dark
            theme, so darken it and vignette the edges to near-black here (CSS,
            so the source file stays pristine). */}
        <div className="relative min-h-[360px] lg:min-h-0 overflow-hidden bg-background border-b lg:border-b-0 lg:border-r border-border/60">
          <img
            src="/images/store-front-1.jpg"
            alt="Inside the Strike Arms store"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.46) contrast(1.1) saturate(0.78)" }}
          />
          {/* Vignette — fades the edges to black so a light photo reads on dark */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(0,0,0,0) 22%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.96) 100%)",
            }}
          />
          {/* Blend the inner edge into the content column */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/70" />
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center p-8 md:p-14 lg:p-20 bg-card">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-3">
            Not sure what to buy?
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.9] mb-10">
            Why <span className="text-accent">Strike Arms</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-6 md:gap-8 mb-10">
            {REASONS.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.title} className="flex flex-col gap-3">
                  <div className="w-11 h-11 rounded-sm bg-muted border border-border/60 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{r.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{r.copy}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Link
              href="/contact"
              className="group inline-flex h-16 items-center justify-center gap-2 rounded-none bg-accent px-10 text-base font-black uppercase tracking-wider text-accent-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Talk to Alan
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="tel:+353872736351"
              className="inline-flex h-16 items-center justify-center rounded-none border-2 border-border bg-transparent px-10 text-base font-black uppercase tracking-wider text-foreground hover:border-accent hover:text-accent transition-colors"
            >
              Call +353 87 273 6351
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
