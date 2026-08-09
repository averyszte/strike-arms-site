import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { HeroVideoBg } from "@/components/demo/hero-video-bg";

/**
 * Direction B — "Drop" hero. Streetwear-drop energy: oversized display type
 * bleeding to the edges over a full-bleed plate, stark black + safety orange.
 * Bespoke demo hero — the live HeroSection is untouched.
 */
export function HeroDrop() {
  return (
    <section className="relative min-h-[92vh] flex items-end overflow-hidden bg-[#0a0a0a] text-[#f5f1ea]">
      <HeroVideoBg className="opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-[#0a0a0a]/60 pointer-events-none" />

      {/* Oversized wordmark */}
      <div className="relative z-10 w-full px-4 md:px-8 pb-10 md:pb-16 pt-28">
        <p className="font-sans font-bold uppercase tracking-[0.4em] text-xs md:text-sm text-[#ff5a1f] mb-4 pl-1">
          Strike Arms — Dublin
        </p>
        <h1 className="font-sans font-black uppercase leading-[0.82] tracking-[-0.02em] text-[clamp(3.5rem,17vw,15rem)]">
          Gear
          <br />
          <span className="text-[#ff5a1f]">Up.</span>
        </h1>

        <div className="mt-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <p className="font-sans text-lg md:text-xl text-[#c9c4ba] max-w-md leading-snug">
            Rifles, sidearms and full loadouts — stocked and serviced by the
            oldest airsoft shop in the city.
          </p>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/store"
              className="group inline-flex items-center gap-2 bg-[#ff5a1f] px-8 h-14 font-sans font-black uppercase text-sm tracking-wider text-[#0a0a0a] hover:bg-[#f5f1ea] transition-colors"
            >
              Shop the drop
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center px-8 h-14 border-2 border-[#f5f1ea]/30 font-sans font-black uppercase text-sm tracking-wider hover:border-[#ff5a1f] hover:text-[#ff5a1f] transition-colors"
            >
              The shop
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
