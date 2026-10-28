import { Eyebrow, NumberedRows, REASONS, WhyCtas } from "@/components/demo/drafts/why-drafts-a";

/** C: one big manifesto line over a full-bleed photo, reasons as ruled rows. */
export function WhyManifesto() {
  return (
    <section className="relative overflow-hidden bg-background">
      <img
        src="/images/store-front-1.jpg"
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.45) contrast(1.1) saturate(0.7)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
      <div className="relative container mx-auto px-4 md:px-6 py-20 md:py-32">
        <Eyebrow>Why Strike Arms</Eyebrow>
        <p className="max-w-5xl text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.92]">
          We play it. We fix it. <span className="text-accent">We'll tell you straight</span> what's worth buying.
        </p>
        <div className="mt-14 md:mt-20 grid lg:grid-cols-[1fr_auto] gap-10 items-end">
          <NumberedRows outlined={false} />
          <WhyCtas />
        </div>
      </div>
    </section>
  );
}

const STAGGER = ["/images/about-store.png", "/images/expert-advice.png", "/images/why-buy.png", "/images/category-repairs.png"];

/** D: photo-led cards, staggered, each reason with its own picture. */
export function WhyPhotoCards() {
  return (
    <section className="py-16 md:py-24 bg-[hsl(0_0%_7%)] border-y border-white/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <Eyebrow>Not sure what to buy?</Eyebrow>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.9]">
              Why <span className="text-accent">Strike Arms</span>
            </h2>
          </div>
          <WhyCtas />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REASONS.map((r, i) => (
            <article key={r.title} className={i % 2 === 1 ? "lg:mt-12" : ""}>
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={STAGGER[i]}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ filter: "brightness(0.55) saturate(0.7)" }}
                />
                <span className="absolute top-2 left-4 font-black text-6xl text-foreground/90 leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-black uppercase tracking-tight">{r.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{r.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const SPEC = [
  ["Advice", "From people who play. Ask anything, in the shop or on the phone."],
  ["New players", "We'll set you up with what you need and nothing you don't."],
  ["Pricing", "Fair, no inflated markups on gear or replicas."],
  ["Workshop", "Repairs, servicing, hop-up tuning and upgrades in-house."],
  ["After you buy", "Something not right? Bring it back to the counter."],
  ["Where", "Walk-in store in Swords, Co. Dublin."],
];

/** E: a spec-sheet table. Very dense, very "workshop". */
export function WhySpecSheet() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-[1fr_1.5fr] gap-10 lg:gap-16">
        <div>
          <Eyebrow>Spec sheet</Eyebrow>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.9] mb-8">
            Why <span className="text-accent">Strike Arms</span>
          </h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Seventeen years of selling, fixing and playing. Here's what that gets you.
          </p>
          <WhyCtas />
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

