import { Link } from "wouter";
import { ArrowRight, Camera, MapPin, Phone, Quote } from "lucide-react";

import { BUSINESS } from "@/lib/site-config";
import { MAPS_DIRECTIONS_URL } from "@/lib/shop-location";
import { CTA_ARROW, CTA_PRIMARY, CTA_SECONDARY, EYEBROW, phoneHref } from "@/lib/storefront-styles";
import { RANGE_HREF } from "@/lib/evolution-range-groups";

/**
 * Shared pieces for the "owner's pick" Evolution drafts (evolution-drafts-a).
 * Grouping, the photo placeholder, the pull quote and the shop CTA.
 */


export function PhotoToCome({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 bg-muted text-muted-foreground border border-dashed border-border ${className}`}
    >
      <Camera className="w-7 h-7" aria-hidden="true" />
      <span className="text-[11px] font-black uppercase tracking-[0.2em]">Photo to come</span>
    </div>
  );
}

export function Eyebrow({ children }: { children: string }) {
  return <p className={`${EYEBROW} mb-3`}>{children}</p>;
}

/** Alan's pull quote. The words are a placeholder until Alan supplies his own. */
export function OwnerQuote({ size = "lg" }: { size?: "lg" | "xl" }) {
  const text = size === "xl" ? "text-3xl md:text-5xl lg:text-6xl" : "text-2xl md:text-4xl";
  return (
    <figure>
      <Quote className="w-10 h-10 md:w-12 md:h-12 text-accent mb-4" aria-hidden="true" />
      <blockquote className={`${text} font-black uppercase tracking-tight leading-[0.95] text-foreground`}>
        [Alan's line on why he backs Evolution]
      </blockquote>
      <figcaption className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-sm font-black uppercase tracking-wider text-foreground">Alan</span>
        <span className="text-sm text-muted-foreground">Owner, Strike Arms, Swords</span>
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-accent">
          Placeholder, awaiting Alan's words
        </span>
      </figcaption>
    </figure>
  );
}

/** "Handle one in the shop in Swords": directions plus a call button. */
export function ShopCtas() {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
      <a href={MAPS_DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className={CTA_PRIMARY}>
        <MapPin className="w-5 h-5" aria-hidden="true" />
        Get directions
      </a>
      <a href={phoneHref(BUSINESS.telephone)} className={CTA_SECONDARY}>
        <Phone className="w-5 h-5" aria-hidden="true" />
        Call the shop
      </a>
    </div>
  );
}

export function RangeLink({ label = "See the Evolution range" }: { label?: string }) {
  return (
    <Link
      href={RANGE_HREF}
      className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground hover:text-accent transition-colors"
    >
      {label}
      <ArrowRight className={CTA_ARROW} aria-hidden="true" />
    </Link>
  );
}
