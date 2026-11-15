import { useState } from "react";
import { MapPin } from "lucide-react";

import { BUSINESS } from "@/lib/site-config";
import { ADDRESS_LINES, MAPS_EMBED_URL } from "@/lib/shop-location";

/**
 * The shop map, click to load. Nothing is fetched from Google until the
 * visitor asks for the map, so a home page visit sends no data to Google
 * (PD13). Until then it is a styled address panel with a "Show map" button.
 */
export function ShopMapFacade() {
  const [isLoaded, setIsLoaded] = useState(false);

  if (isLoaded) {
    return (
      <iframe
        title={`Map showing ${BUSINESS.name}, ${BUSINESS.addressLocality}`}
        src={MAPS_EMBED_URL}
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full border-0 [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.7)_contrast(0.9)]"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-6 text-center bg-[radial-gradient(circle_at_center,hsl(var(--accent)/0.12),transparent_65%)]">
      <MapPin className="h-10 w-10 text-accent" aria-hidden="true" />
      <p className="text-base text-foreground leading-relaxed">
        {ADDRESS_LINES.map((line) => (
          <span key={line} className="block">{line}</span>
        ))}
      </p>
      <button
        type="button"
        onClick={() => setIsLoaded(true)}
        className="h-12 px-6 inline-flex items-center justify-center rounded-none border-2 border-border text-foreground font-black uppercase tracking-wider hover:border-accent hover:text-accent transition-colors"
      >
        Show map
      </button>
      <p className="max-w-xs text-xs text-muted-foreground">
        The map is from Google Maps. Showing it loads it from Google, and Google&rsquo;s terms and
        privacy policy apply.
      </p>
    </div>
  );
}
