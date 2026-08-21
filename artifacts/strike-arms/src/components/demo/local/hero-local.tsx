import { Link } from "wouter";
import { ArrowRight, MapPin } from "lucide-react";

/**
 * Direction C — "The Local" hero. Warm heritage identity: cream/espresso
 * palette, serif headline, photography-led, calm and human. Bespoke demo hero
 * — the live HeroSection is untouched.
 */
export function HeroLocal() {
  return (
    <section className="bg-[#f4efe6] text-[#26201b]">
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-16 md:pt-40 md:pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-[#b06a2c] mb-6">
            Dublin airsoft for 17 years
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight mb-8">
            The airsoft shop
            <br />
            Dublin grew up with.
          </h1>
          <p className="font-sans text-lg text-[#6b6157] max-w-md leading-relaxed mb-10">
            Seventeen years, one counter, and the same advice we'd give a mate:
            buy what you'll actually use. Come in, handle the gear, ask anything.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <Link
              href="/store"
              className="group inline-flex items-center gap-2 rounded-full bg-[#26201b] px-8 h-13 py-3.5 font-sans font-semibold text-sm text-[#f4efe6] hover:bg-[#b06a2c] transition-colors"
            >
              Browse the shop
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 font-sans font-semibold text-sm text-[#26201b] hover:text-[#b06a2c] transition-colors"
            >
              <MapPin className="w-4 h-4 text-[#b06a2c]" />
              Visit us in Swords
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-xl">
            <img
              src="/images/about-store.png"
              alt="Inside the Strike Arms shop in Swords, Co. Dublin"
              className="absolute inset-0 w-full h-full object-cover"
              fetchPriority="high"
            />
          </div>
          <div className="absolute -bottom-5 -left-5 bg-[#b06a2c] text-[#f4efe6] rounded-xl px-6 py-4 shadow-lg">
            <p className="font-serif text-3xl leading-none">17</p>
            <p className="font-sans text-xs uppercase tracking-wider mt-1">
              years in Dublin
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
