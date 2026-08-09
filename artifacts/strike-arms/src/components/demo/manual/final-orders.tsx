import { Link } from "wouter";
import { MapPin, Phone, ArrowRight } from "lucide-react";

/**
 * Direction A — closing CTA styled as a dispatch/orders block.
 */
export function FinalOrders() {
  return (
    <section className="relative overflow-hidden bg-[#ff5a1f] text-[#0b0c09]">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,12,9,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,12,9,0.06)_1px,transparent_1px)] bg-[size:34px_34px]" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28">
        <p className="font-mono text-xs tracking-[0.3em] uppercase mb-6">
          05 — Report to the armory
        </p>
        <h2 className="font-sans font-black uppercase text-4xl md:text-6xl lg:text-7xl leading-[0.9] tracking-tight max-w-3xl mb-8">
          Come in. Handle the gear. Ask anything.
        </h2>
        <p className="font-mono text-sm md:text-base max-w-xl mb-10 leading-relaxed">
          The only walk-in airsoft store in north Dublin. Pop into the shop in
          Swords — no appointment, no pressure.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 bg-[#0b0c09] text-[#e9e7dc] px-7 h-12 font-mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#12130d] transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Find the shop
          </Link>
          <a
            href="tel:+353872736351"
            className="inline-flex items-center gap-2 border-2 border-[#0b0c09] px-7 h-12 font-mono text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#0b0c09] hover:text-[#e9e7dc] transition-colors"
          >
            <Phone className="w-4 h-4" />
            +353 87 273 6351
          </a>
          <Link
            href="/store"
            className="inline-flex items-center gap-2 px-4 h-12 font-mono text-xs font-bold uppercase tracking-[0.2em] hover:underline underline-offset-4"
          >
            Shop online
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
