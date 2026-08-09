import { Star } from "lucide-react";

/**
 * Direction C — reviews as warm, calm testimonial cards. Real review text
 * reused from the live ReviewsSection (not invented). Exact Google count
 * omitted per the validation report.
 */
const REVIEWS = [
  { text: "Alan really knows his stuff. Helped me choose my first AEG and I have had zero regrets.", author: "Mark D." },
  { text: "I had no idea where to start. Alan spent 20 mins with me explaining setups. Could not ask for better service.", author: "Jamie L." },
  { text: "Great selection, honest advice, and never any pressure to overspend.", author: "Aoife B." },
];

export function ReviewsLocal() {
  return (
    <section className="bg-[#efe8dc] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-5 h-5 ${i < 4 ? "fill-[#b06a2c] text-[#b06a2c]" : "text-[#26201b]/20"}`} />
            ))}
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#26201b] tracking-tight">
            What Dublin players say
          </h2>
          <p className="font-sans text-sm text-[#6b6157] mt-3">
            Rated 4.7 out of 5 on Google
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((r) => (
            <figure
              key={r.author}
              className="bg-[#f4efe6] rounded-2xl p-8 flex flex-col shadow-sm"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-[#b06a2c] text-[#b06a2c]" />
                ))}
              </div>
              <blockquote className="font-serif text-lg text-[#26201b] leading-snug flex-1">
                {r.text}
              </blockquote>
              <figcaption className="mt-6 font-sans text-sm font-semibold text-[#6b6157]">
                {r.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
