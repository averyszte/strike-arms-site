import { useState } from "react";

const brands: { name: string; src: string; h: number; w: number }[] = [
  { name: "G&G Armament",  src: "/images/brands/gandg.png",       h: 36, w: 36  },
  { name: "Tokyo Marui",   src: "/images/brands/tokyo-marui.png", h: 28, w: 120 },
  { name: "ICS",           src: "/images/brands/ics.svg",         h: 32, w: 100 },
  { name: "Krytac",        src: "/images/brands/krytac.webp",     h: 28, w: 120 },
  { name: "Nuprol",        src: "/images/brands/nuprol.svg",      h: 30, w: 130 },
  { name: "ASG",           src: "/images/brands/asg.svg",         h: 32, w: 110 },
  { name: "WE Tech",       src: "/images/brands/we.png",          h: 24, w: 110 },
  { name: "Vorsk",         src: "/images/brands/vorsk.svg",       h: 28, w: 100 },
  { name: "Valken",        src: "/images/brands/valken.svg",      h: 28, w: 115 },
  { name: "Specna Arms",   src: "/images/brands/specna-arms.svg", h: 26, w: 150 },
];

export function BrandMarquee() {
  const [paused, setPaused] = useState(false);
  const doubled = [...brands, ...brands];

  return (
    <div className="relative bg-[#0d0d0d] border-y border-border/40 overflow-hidden py-5">
      {/* Fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10 bg-gradient-to-r from-[#0d0d0d] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10 bg-gradient-to-l from-[#0d0d0d] to-transparent" />

      <div
        className="flex items-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex items-center gap-12 animate-marquee whitespace-nowrap"
          style={{ animationPlayState: paused ? "paused" : "running" }}
        >
          {doubled.map((brand, i) => (
            <span key={i} className="flex items-center gap-12 shrink-0">
              <img
                src={brand.src}
                alt={brand.name}
                height={brand.h}
                width={brand.w}
                className="object-contain transition-opacity duration-300 opacity-50 hover:opacity-80"
                style={{
                  height: brand.h,
                  width: brand.w,
                  filter: "brightness(0) invert(1)",
                }}
                draggable={false}
              />
              <span className="w-px h-4 bg-white/10 shrink-0" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
