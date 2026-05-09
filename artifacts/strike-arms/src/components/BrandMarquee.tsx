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

function BrandGroup() {
  return (
    <div className="flex items-center gap-10 shrink-0 pr-10" aria-hidden>
      {brands.map((brand, i) => (
        <span key={i} className="flex items-center gap-10 shrink-0">
          <img
            src={brand.src}
            alt={brand.name}
            draggable={false}
            className="object-contain opacity-40 hover:opacity-70 transition-opacity duration-300"
            style={{
              height: brand.h,
              width: brand.w,
              filter: "brightness(0) invert(1)",
            }}
          />
          <span className="w-px h-4 bg-white/8 shrink-0" />
        </span>
      ))}
    </div>
  );
}

export function BrandMarquee() {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="relative overflow-hidden py-5"
      style={{
        background: "#111111",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Fade edges */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10"
        style={{ background: "linear-gradient(to right, #111111, transparent)" }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10"
        style={{ background: "linear-gradient(to left, #111111, transparent)" }}
      />

      {/* Track — 3 copies so one-third translate = seamless loop */}
      <div
        className="flex items-center animate-marquee"
        style={{
          animationPlayState: paused ? "paused" : "running",
          width: "max-content",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <BrandGroup />
        <BrandGroup />
        <BrandGroup />
      </div>
    </div>
  );
}
