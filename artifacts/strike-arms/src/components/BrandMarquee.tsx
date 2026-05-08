import { useRef, useState } from "react";

const brands = [
  { name: "G&G", style: "font-black tracking-[0.12em]" },
  { name: "Specna Arms", style: "font-bold tracking-[0.08em]" },
  { name: "Tokyo Marui", style: "font-black tracking-[0.1em]" },
  { name: "ASG", style: "font-black tracking-[0.2em]" },
  { name: "Vorsk", style: "font-bold tracking-[0.14em]" },
  { name: "Nuprol", style: "font-black tracking-[0.12em]" },
  { name: "Valken", style: "font-bold tracking-[0.16em]" },
  { name: "WE Tech", style: "font-black tracking-[0.18em]" },
  { name: "Krytac", style: "font-black tracking-[0.1em]" },
  { name: "ICS", style: "font-black tracking-[0.25em]" },
];

export function BrandMarquee() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="relative bg-[#0d0d0d] border-y border-border/40 overflow-hidden py-5">
      {/* Left fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-[#0d0d0d] to-transparent" />
      {/* Right fade */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-[#0d0d0d] to-transparent" />

      <div
        className="flex items-center"
        style={{ animationPlayState: paused ? "paused" : "running" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex items-center gap-10 animate-marquee whitespace-nowrap"
          style={{ animationPlayState: paused ? "paused" : "running" }}
        >
          {[...brands, ...brands].map((brand, i) => (
            <span key={i} className="flex items-center gap-10 shrink-0">
              <span
                className={`text-[11px] uppercase text-white/40 hover:text-white/70 transition-colors cursor-default select-none ${brand.style}`}
              >
                {brand.name}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/15 shrink-0" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
