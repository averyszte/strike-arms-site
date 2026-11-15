import { useState } from "react";
import { Link } from "wouter";

import { MarqueePauseButton } from "@/components/marquee-pause-button";
import { BRAND_LOGOS, BRAND_LOGO_HEIGHT, type BrandLogo } from "@/lib/brand-logos";

const LOGO_CLASS = "w-auto object-contain opacity-40 hover:opacity-70 transition-opacity duration-300";

function LogoImage({ brand, isCopy }: { brand: BrandLogo; isCopy: boolean }) {
  return (
    <img
      src={brand.src}
      alt={isCopy ? "" : brand.name}
      width={brand.width}
      height={brand.height}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={LOGO_CLASS}
      style={{ height: BRAND_LOGO_HEIGHT, filter: "brightness(0) invert(1)" }}
    />
  );
}

/**
 * One run of logos. The first run is the one screen readers and the keyboard
 * reach; the two copies that make the loop seamless are hidden from both.
 * A logo whose brand the shop lists links to its brand page.
 */
function BrandGroup({ isCopy }: { isCopy: boolean }) {
  return (
    <div className="flex items-center gap-10 shrink-0 pr-10" aria-hidden={isCopy || undefined}>
      {BRAND_LOGOS.map((brand) => (
        <span key={brand.src} className="flex items-center gap-10 shrink-0">
          {brand.brandSlug ? (
            <Link href={`/brands/${brand.brandSlug}`} tabIndex={isCopy ? -1 : undefined}>
              <LogoImage brand={brand} isCopy={isCopy} />
            </Link>
          ) : (
            <LogoImage brand={brand} isCopy={isCopy} />
          )}
          <span className="w-px h-4 bg-white/8 shrink-0" aria-hidden="true" />
        </span>
      ))}
    </div>
  );
}

export function BrandMarquee() {
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div
      className="relative overflow-hidden py-5"
      data-paused={isPaused || isHovered}
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

      {/* Track — 3 copies so one-third translate = seamless loop. Keyboard
          focus on a logo link pauses it too, so the link holds still. */}
      <div
        className="flex items-center animate-marquee"
        style={{ width: "max-content" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        <BrandGroup isCopy={false} />
        <BrandGroup isCopy />
        <BrandGroup isCopy />
      </div>

      <MarqueePauseButton
        isPaused={isPaused}
        onToggle={() => setIsPaused((p) => !p)}
        label="brand logos"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20"
      />
    </div>
  );
}
