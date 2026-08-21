import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

/**
 * Direction C — Alan's story as a warm editorial pull-quote panel. Human and
 * calm; the person, not the product. Claims kept as Alan stated.
 */
export function StoryLocal() {
  return (
    <section className="bg-[#f4efe6] text-[#26201b] py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-[#b06a2c] mb-8">
          Meet Alan
        </p>
        <blockquote className="font-serif text-2xl md:text-4xl leading-[1.3] tracking-tight mb-10">
          "I've been doing this seventeen years. I'm not here to sell you the
          most expensive gun on the shelf — I'm here to get you the right one,
          and to fix it when it needs fixing."
        </blockquote>
        <p className="font-sans text-base text-[#6b6157] max-w-xl mx-auto mb-10 leading-relaxed">
          Strike Arms is the oldest airsoft shop in Dublin and the only walk-in
          store in the north of the city. Same face behind the counter, same face
          at the workbench.
        </p>
        <Link
          href="/about"
          className="inline-flex items-center gap-2 font-sans font-semibold text-sm text-[#26201b] border-b-2 border-[#b06a2c] pb-1 hover:text-[#b06a2c] transition-colors"
        >
          Read Alan's story
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
