import { Star, Quote } from "lucide-react";

/**
 * Combined homepage — reviews as pull-quotes. Real review text reused from the
 * live ReviewsSection (not invented). The hardcoded "90 Google Reviews" count
 * is dropped per the validation report — rating and source only.
 */
const REVIEWS = [
  { text: "Best airsoft shop in Dublin, hands down. Fair prices and the advice is worth the visit alone.", author: "Conor M." },
  { text: "Alan spent 20 minutes explaining setups. Couldn't ask for better service.", author: "Jamie L." },
  { text: "Fixed my rifle fast and cheaply. Wouldn't go anywhere else for repairs.", author: "David K." },
];

export function ReviewsFeature() {
  return (
    <section className="py-16 md:py-24 bg-card border-b border-border/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-10 md:mb-14">
          <span className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${i < 4 ? "fill-accent text-accent" : "text-border"}`}
              />
            ))}
          </span>
          <span className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground">
            4.7 / 5 · Google
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {REVIEWS.map((r) => (
            <figure key={r.author} className="flex flex-col">
              <Quote className="w-8 h-8 text-accent mb-4" />
              <blockquote className="text-2xl md:text-3xl font-black leading-[1.05] tracking-tight text-foreground flex-1">
                {r.text}
              </blockquote>
              <figcaption className="mt-6 text-sm font-black uppercase tracking-wider text-muted-foreground">
                {r.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
