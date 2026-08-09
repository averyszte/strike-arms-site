import { Star, Quote } from "lucide-react";

/**
 * Direction B — reviews as bold oversized pull-quotes. Real review text reused
 * from the live ReviewsSection (not invented). Exact Google count omitted per
 * the validation report.
 */
const REVIEWS = [
  { text: "Best airsoft shop in Dublin, hands down. Fair prices and the advice is worth the visit alone.", author: "Conor M." },
  { text: "Alan spent 20 mins explaining setups. Could not ask for better service.", author: "Jamie L." },
  { text: "Fixed my rifle fast and cheaply. Would not go anywhere else for repairs.", author: "David K." },
];

export function DropReviews() {
  return (
    <section className="bg-[#f5f1ea] text-[#0a0a0a] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-3 mb-12">
          <span className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-6 h-6 ${i < 4 ? "fill-[#ff5a1f] text-[#ff5a1f]" : "text-[#0a0a0a]/25"}`} />
            ))}
          </span>
          <span className="font-sans font-black uppercase text-lg tracking-tight">
            4.7 / 5 on Google
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((r) => (
            <figure key={r.author} className="flex flex-col">
              <Quote className="w-8 h-8 text-[#ff5a1f] mb-4" />
              <blockquote className="font-sans font-bold text-xl md:text-2xl leading-tight tracking-tight flex-1">
                {r.text}
              </blockquote>
              <figcaption className="mt-6 font-sans font-black uppercase text-sm tracking-wider text-[#4a4a45]">
                {r.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
