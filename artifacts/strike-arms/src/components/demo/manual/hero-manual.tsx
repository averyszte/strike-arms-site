import { Link } from "wouter";
import { Crosshair, ChevronRight } from "lucide-react";
import { HeroVideoBg } from "@/components/demo/hero-video-bg";

/**
 * Direction A — "Field Manual". Bespoke demo hero (live HeroSection untouched).
 * Tactical spec-sheet identity: mono type, corner brackets, reticle, safety
 * orange on near-black olive. Deliberately nothing like the other two demos.
 */
export function HeroManual() {
  return (
    <section className="relative min-h-[88vh] flex flex-col justify-between overflow-hidden bg-[#0b0c09] text-[#e9e7dc]">
      {/* Background plate */}
      <HeroVideoBg className="opacity-35" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(233,231,220,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(233,231,220,0.05)_1px,transparent_1px)] bg-[size:34px_34px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c09] via-[#0b0c09]/40 to-[#0b0c09]/70 pointer-events-none" />

      {/* Top data rail */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-24 md:pt-28 font-mono text-[10px] md:text-xs tracking-[0.25em] uppercase text-[#9a9a86]">
        <span>SA // Field Manual</span>
        <span className="hidden sm:inline">53.4597° N, 6.2181° W — Swords, Co. Dublin</span>
        <span className="text-[#ff5a1f]">● Live</span>
      </div>

      {/* Title block */}
      <div className="relative z-10 px-6 md:px-10 pb-6">
        <div className="max-w-5xl">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#ff5a1f] mb-5">
            17 years on — Dublin's oldest airsoft shop
          </p>
          <h1 className="font-sans font-black uppercase leading-[0.86] tracking-tight text-[clamp(3rem,11vw,9rem)]">
            Strike
            <br />
            Arms
          </h1>
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 max-w-2xl">
            <p className="font-mono text-sm text-[#c7c5b8] leading-relaxed flex-1">
              Rifles, sidearms, gear and in-house servicing — issued by a shop
              that actually plays. No warehouse. No guesswork.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/store"
              className="group inline-flex items-center gap-2 bg-[#ff5a1f] px-7 h-12 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0b0c09] hover:bg-[#ff6f3a] transition-colors"
            >
              Enter the armory
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 border border-[#e9e7dc]/25 px-7 h-12 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#e9e7dc] hover:border-[#ff5a1f] hover:text-[#ff5a1f] transition-colors"
            >
              <Crosshair className="w-4 h-4" />
              Book servicing
            </Link>
          </div>
        </div>
      </div>

      {/* Corner brackets */}
      <span className="pointer-events-none absolute top-20 left-4 md:left-6 w-6 h-6 border-l-2 border-t-2 border-[#ff5a1f]/70" />
      <span className="pointer-events-none absolute top-20 right-4 md:right-6 w-6 h-6 border-r-2 border-t-2 border-[#ff5a1f]/70" />
      <span className="pointer-events-none absolute bottom-4 left-4 md:left-6 w-6 h-6 border-l-2 border-b-2 border-[#ff5a1f]/70" />
      <span className="pointer-events-none absolute bottom-4 right-4 md:right-6 w-6 h-6 border-r-2 border-b-2 border-[#ff5a1f]/70" />
    </section>
  );
}
