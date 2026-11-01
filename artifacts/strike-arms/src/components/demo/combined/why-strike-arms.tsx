import { Link } from "wouter";
import { ArrowRight, Phone } from "lucide-react";

/**
 * Combined homepage — "Why Strike Arms" as a spec sheet: what you get, one
 * ruled row each, beside the contact CTAs. Picked from /drafts/sections.
 */
const SPEC = [
  ["Advice", "From people who play. Ask anything, in the shop or on the phone."],
  ["New players", "We'll set you up with what you need and nothing you don't."],
  ["Pricing", "Fair, no inflated markups on gear or replicas."],
  ["Workshop", "Repairs, servicing, hop-up tuning and upgrades in-house."],
  ["After you buy", "Something not right? Bring it back to the counter."],
  ["Where", "Walk-in store in Swords, Co. Dublin."],
];

export function WhyStrikeArms() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-[1fr_1.5fr] gap-10 lg:gap-16">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-3">Spec sheet</p>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.9] mb-8">
            Why <span className="text-accent">Strike Arms</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Seventeen years of selling, fixing and playing. Here's what that gets you.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Link
              href="/contact"
              className="group inline-flex h-14 items-center justify-center gap-2 bg-accent px-8 text-sm font-black uppercase tracking-wider text-accent-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Talk to Alan
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="tel:+353872736351"
              className="inline-flex h-14 items-center justify-center gap-2 border-2 border-border px-8 text-sm font-black uppercase tracking-wider text-foreground hover:border-accent hover:text-accent transition-colors"
            >
              <Phone className="w-4 h-4" /> +353 87 273 6351
            </a>
          </div>
        </div>
        <dl className="border-t border-white/10 font-mono text-sm">
          {SPEC.map(([term, detail]) => (
            <div key={term} className="grid grid-cols-[9rem_1fr] md:grid-cols-[12rem_1fr] gap-4 py-4 border-b border-white/10">
              <dt className="uppercase tracking-widest text-accent">{term}</dt>
              <dd className="text-foreground/90 font-sans text-base">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
