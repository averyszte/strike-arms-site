import { useState } from "react";
import { BRAND_LOGOS, BRAND_LOGO_HEIGHT } from "@/lib/brand-logos";

function BrandGroup() {
  return (
    <div className="flex items-center gap-10 shrink-0 pr-10" aria-hidden>
      {BRAND_LOGOS.map((brand, i) => (
        <span key={i} className="flex items-center gap-10 shrink-0">
          <img
            src={brand.src}
            alt={brand.name}
            draggable={false}
            className="w-auto object-contain opacity-40 hover:opacity-70 transition-opacity duration-300"
            style={{
              height: BRAND_LOGO_HEIGHT,
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
