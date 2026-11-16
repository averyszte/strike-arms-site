import { useState } from "react";
import { Link } from "wouter";

import { useBrands } from "@/hooks/use-brands";
import { BRAND_LOGO_HEIGHT, MARQUEE_LOGOS, type BrandLogo } from "@/lib/brand-logos";

/** Long enough that the logos drift at the pace they had before Evolution was added. */
const MARQUEE_DURATION = "54s";

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
 * A logo links to its brand page only while the catalogue has published
 * products from that brand; otherwise the page would be "not found".
 */
function BrandGroup({ isCopy, listedSlugs }: { isCopy: boolean; listedSlugs: ReadonlySet<string> }) {
  return (
    <div className="flex items-center gap-10 shrink-0 pr-10" aria-hidden={isCopy || undefined}>
      {MARQUEE_LOGOS.map((brand, index) => {
        // Evolution repeats through the run; only its first logo is announced.
        const isRepeat = isCopy || MARQUEE_LOGOS.indexOf(brand) !== index;
        return (
          <span key={`${brand.src}-${index}`} className="flex items-center gap-10 shrink-0">
            {brand.brandSlug && listedSlugs.has(brand.brandSlug) ? (
              <Link
                href={`/brands/${brand.brandSlug}`}
                tabIndex={isRepeat ? -1 : undefined}
                aria-hidden={isRepeat || undefined}
              >
                <LogoImage brand={brand} isCopy={isRepeat} />
              </Link>
            ) : (
              <LogoImage brand={brand} isCopy={isRepeat} />
            )}
            <span className="w-px h-4 bg-white/8 shrink-0" aria-hidden="true" />
          </span>
        );
      })}
    </div>
  );
}

export function BrandMarquee() {
  const [isHovered, setIsHovered] = useState(false);
  const { data: brands } = useBrands();
  const listedSlugs = new Set((brands ?? []).map((entry) => entry.slug));

  return (
    <div
      className="relative overflow-hidden py-5"
      data-paused={isHovered}
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
        style={{ width: "max-content", ["--marquee-duration" as string]: MARQUEE_DURATION }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        <BrandGroup isCopy={false} listedSlugs={listedSlugs} />
        <BrandGroup isCopy listedSlugs={listedSlugs} />
        <BrandGroup isCopy listedSlugs={listedSlugs} />
      </div>
    </div>
  );
}
