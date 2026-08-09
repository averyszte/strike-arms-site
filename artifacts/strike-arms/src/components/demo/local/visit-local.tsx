import { Link } from "wouter";
import { MapPin, Phone } from "lucide-react";

/**
 * Direction C — closing "come visit" panel. Warm, personal, walk-in first.
 */
export function VisitLocal() {
  return (
    <section className="bg-[#26201b] text-[#f4efe6] py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-[#e0a06a] mb-6">
          The only walk-in airsoft store in north Dublin
        </p>
        <h2 className="font-serif text-4xl md:text-6xl tracking-tight leading-[1.05] mb-8">
          Kettle's on. Come have a look.
        </h2>
        <p className="font-sans text-lg text-[#c9beb0] max-w-xl mx-auto mb-10 leading-relaxed">
          Pop into the shop in Swords, Co. Dublin — no appointment, no pressure.
          Handle the gear, ask the daft questions, walk out with the right kit.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 rounded-full bg-[#b06a2c] px-8 py-4 font-sans font-semibold text-sm text-[#f4efe6] hover:bg-[#c47d3c] transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Find the shop
          </Link>
          <a
            href="tel:+353872736351"
            className="inline-flex items-center gap-2 rounded-full border border-[#f4efe6]/25 px-8 py-4 font-sans font-semibold text-sm hover:border-[#e0a06a] hover:text-[#e0a06a] transition-colors"
          >
            <Phone className="w-4 h-4" />
            +353 87 273 6351
          </a>
        </div>
      </div>
    </section>
  );
}
