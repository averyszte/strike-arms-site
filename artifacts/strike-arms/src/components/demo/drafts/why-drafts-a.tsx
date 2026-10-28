import { Link } from "wouter";
import { ArrowRight, Phone } from "lucide-react";

/**
 * "Why Strike Arms" drafts, part one: numbered ruled rows instead of the
 * icon-in-a-box grid. Copy is the live section's four reasons.
 */
export const REASONS = [
  { title: "Expert gear advice", copy: "We've tested what we sell. Real recommendations from people who actually play." },
  { title: "Beginner-friendly", copy: "New to airsoft? We'll walk you through what you need, and nothing you don't." },
  { title: "Fair pricing", copy: "No inflated markups. Competitive prices on quality gear and replicas." },
  { title: "After-sale support", copy: "Issue after purchase? Need an upgrade installed? We're here to help." },
];

export const PHONE_HREF = "tel:+353872736351";
export const PHONE_LABEL = "+353 87 273 6351";

export function Eyebrow({ children }: { children: string }) {
  return <p className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-3">{children}</p>;
}

export function WhyCtas() {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
      <Link
        href="/contact"
        className="group inline-flex h-14 items-center justify-center gap-2 bg-accent px-8 text-sm font-black uppercase tracking-wider text-accent-foreground hover:bg-foreground hover:text-background transition-colors"
      >
        Talk to Alan
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
      <a
        href={PHONE_HREF}
        className="inline-flex h-14 items-center justify-center gap-2 border-2 border-border px-8 text-sm font-black uppercase tracking-wider text-foreground hover:border-accent hover:text-accent transition-colors"
      >
        <Phone className="w-4 h-4" /> {PHONE_LABEL}
      </a>
    </div>
  );
}

export function NumberedRows({ outlined = true }: { outlined?: boolean }) {
  return (
    <ol className="border-t border-white/10">
      {REASONS.map((r, i) => (
        <li key={r.title} className="group grid grid-cols-[auto_1fr] md:grid-cols-[6rem_1fr_1.4fr] gap-x-6 gap-y-1 items-baseline py-6 border-b border-white/10">
          <span
            className={`row-span-2 md:row-span-1 font-black text-5xl md:text-6xl leading-none ${outlined ? "text-transparent group-hover:text-accent transition-colors" : "text-accent"}`}
            style={outlined ? { WebkitTextStroke: "1px hsl(var(--muted-foreground))" } : undefined}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">{r.title}</h3>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{r.copy}</p>
        </li>
      ))}
    </ol>
  );
}

/** A: Alan front and centre, with the reasons as numbered rows beside him. */
export function WhyOwnerRows() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-[5fr_7fr] gap-10 lg:gap-16">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden mb-6">
            <img
              src="/images/expert-advice.png"
              alt="Alan at the Strike Arms counter"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: "brightness(0.7) saturate(0.8)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 text-xs font-black uppercase tracking-[0.2em] text-foreground">
              17 years behind the counter. Photo is a stand-in.
            </p>
          </div>
          <blockquote className="text-xl md:text-2xl font-bold leading-snug border-l-2 border-accent pl-5">
            "If it's not right for how you play, I'll tell you. I'd rather you come back than buy the wrong thing."
          </blockquote>
          <p className="mt-3 pl-5 text-xs text-muted-foreground">Draft quote. Needs Alan's own words.</p>
        </div>
        <div className="flex flex-col justify-center">
          <Eyebrow>Not sure what to buy?</Eyebrow>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.9] mb-10">
            Why <span className="text-accent">Strike Arms</span>
          </h2>
          <NumberedRows />
          <div className="mt-10">
            <WhyCtas />
          </div>
        </div>
      </div>
    </section>
  );
}

const STATS = [
  { value: "17", unit: "years", label: "Selling and fixing airsoft in Dublin" },
  { value: "4.7", unit: "on Google", label: "From customers who've been in the shop" },
  { value: "In-house", unit: "workshop", label: "Repairs, servicing and upgrades on site" },
  { value: "Swords", unit: "Co. Dublin", label: "Walk-in store. Pick it up, try it, ask." },
];

/** B: big stat callouts, with the reasons underneath as small ruled print. */
export function WhyStats() {
  return (
    <section className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <Eyebrow>Why Strike Arms</Eyebrow>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.9]">
              Dublin's airsoft
              <br />
              <span className="text-accent">counter</span>
            </h2>
          </div>
          <WhyCtas />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-l border-white/10">
          {STATS.map((s) => (
            <div key={s.label} className="p-6 md:p-8 border-r border-b border-white/10">
              <p className="font-black uppercase leading-none">
                <span className="block text-5xl xl:text-6xl text-foreground">{s.value}</span>
                <span className="block mt-2 text-lg md:text-xl text-accent">{s.unit}</span>
              </p>
              <p className="mt-4 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {REASONS.map((r) => (
            <div key={r.title} className="border-t-2 border-accent pt-4">
              <h3 className="text-sm font-black uppercase tracking-wider mb-2">{r.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
