import { Link } from "wouter";
import { ArrowRight, Wrench } from "lucide-react";

/**
 * Direction B — big statement + full-bleed image. Carries the story and the
 * in-house repairs differentiator in one loud panel. Claims kept as Alan
 * stated; no turnaround times invented.
 */
export function AlanStatement() {
  return (
    <section className="relative bg-[#0a0a0a] text-[#f5f1ea] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative min-h-[400px] lg:min-h-[640px] order-2 lg:order-1">
          <img
            src="/images/about-store.png"
            alt="Alan at the Strike Arms counter in Swords"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#0a0a0a]" />
        </div>

        <div className="order-1 lg:order-2 flex flex-col justify-center px-4 md:px-8 lg:px-16 py-16 lg:py-0">
          <p className="font-sans font-bold uppercase tracking-[0.3em] text-xs text-[#ff5a1f] mb-6">
            17 years · Oldest in Dublin · Swords
          </p>
          <h2 className="font-sans font-black uppercase text-4xl md:text-6xl leading-[0.9] tracking-tight mb-8">
            Bought here
            <br />
            or not — we
            <br />
            <span className="text-[#ff5a1f]">fix it.</span>
          </h2>
          <p className="font-sans text-lg text-[#c9c4ba] max-w-md mb-10 leading-relaxed">
            The person who sells you the gear is the same one at the workbench.
            Bring it into the Swords shop, talk it through, get it sorted.
            Diagnosis first — no mystery upgrade list.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/services"
              className="group inline-flex items-center gap-2 bg-[#ff5a1f] px-8 h-13 py-4 font-sans font-black uppercase text-sm tracking-wider text-[#0a0a0a] hover:bg-[#f5f1ea] transition-colors"
            >
              <Wrench className="w-5 h-5" strokeWidth={2} />
              Book a repair
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-4 font-sans font-black uppercase text-sm tracking-wider text-[#c9c4ba] hover:text-[#ff5a1f] transition-colors"
            >
              Our story
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
