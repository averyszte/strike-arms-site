import { Link } from "wouter";
import { MapPin, Phone } from "lucide-react";

/**
 * Direction B — closing CTA. Full-bleed black, huge type, walk-in push.
 */
export function FinalDrop() {
  return (
    <section className="bg-[#0a0a0a] text-[#f5f1ea] py-24 md:py-36">
      <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
        <p className="font-sans font-bold uppercase tracking-[0.3em] text-xs text-[#ff5a1f] mb-6">
          North Dublin's only walk-in airsoft store
        </p>
        <h2 className="font-sans font-black uppercase text-6xl md:text-8xl lg:text-9xl leading-[0.85] tracking-[-0.02em] mb-10">
          Come
          <br />
          <span className="text-[#ff5a1f]">say hi.</span>
        </h2>
        <p className="font-sans text-lg text-[#c9c4ba] max-w-lg mx-auto mb-10">
          Handle the gear, ask the questions, walk out sorted. Find us in Swords,
          Co. Dublin.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 bg-[#ff5a1f] px-8 h-14 font-sans font-black uppercase text-sm tracking-wider text-[#0a0a0a] hover:bg-[#f5f1ea] transition-colors"
          >
            <MapPin className="w-5 h-5" />
            Find the shop
          </Link>
          <a
            href="tel:+353872736351"
            className="inline-flex items-center gap-2 border-2 border-[#f5f1ea]/30 px-8 h-14 font-sans font-black uppercase text-sm tracking-wider hover:border-[#ff5a1f] hover:text-[#ff5a1f] transition-colors"
          >
            <Phone className="w-5 h-5" />
            +353 87 273 6351
          </a>
        </div>
      </div>
    </section>
  );
}
