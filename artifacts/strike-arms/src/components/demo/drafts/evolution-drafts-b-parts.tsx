import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, ImageOff } from "lucide-react";

import { EVOLUTION_RANGE_LABELS, type EvolutionDraftRifle } from "@/lib/evolution-draft-data";
import { formatPrice } from "@/lib/format-price";
import { BRAND_HREF, productHref } from "@/lib/evolution-recon-chooser";

/**
 * Shared pieces for the "Find your Evolution" drafts (B1 chooser, B2 price
 * ladder): the photo placeholder, small headings, and the pure selection
 * helpers so the JSX in evolution-drafts-b.tsx stays logic-free.
 */


export function Eyebrow({ children }: { children: string }) {
  return <p className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-3">{children}</p>;
}

/** Stand-in until the Evolution photos are taken. Clearly not a product shot. */
export function PhotoPlaceholder({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={`${label}, photo to come`}
      className={`relative flex flex-col items-center justify-center gap-2 bg-muted border-2 border-dashed border-border text-muted-foreground ${className}`}
    >
      <ImageOff className="w-8 h-8" aria-hidden="true" />
      <span className="text-[11px] font-black uppercase tracking-[0.2em]">Photo to come</span>
    </div>
  );
}

export function RangeLink({ label = "See the full Evolution range" }: { label?: string }) {
  return (
    <Link
      href={BRAND_HREF}
      className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground hover:text-accent transition-colors"
    >
      {label}
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}

export function OptionButton({ isActive, onClick, children }: { isActive: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={`flex-1 text-left px-4 py-3 border-2 rounded-none transition-colors ${
        isActive ? "border-accent bg-accent/10 text-foreground" : "border-border text-muted-foreground hover:border-accent hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function ChooserStep({ index, title, children }: { index: number; title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">
        <span className="text-accent">{String(index).padStart(2, "0")}</span> {title}
      </p>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

export function RangeRow({ rifle }: { rifle: EvolutionDraftRifle }) {
  return (
    <Link href={productHref(rifle.slug)} className="group grid grid-cols-[4.5rem_1fr_auto] gap-4 items-center py-4 border-b border-border">
      <PhotoPlaceholder label={rifle.name} className="aspect-square [&>span]:hidden [&>svg]:w-5 [&>svg]:h-5" />
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-accent">{EVOLUTION_RANGE_LABELS[rifle.range]}</p>
        <h4 className="font-black uppercase tracking-tight leading-tight group-hover:text-accent transition-colors">{rifle.name}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{rifle.short}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-black">{formatPrice(rifle.priceCents)}</span>
        <ArrowUpRight className="w-4 h-4 text-accent" aria-hidden="true" />
      </div>
    </Link>
  );
}

export function SpecRow({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] md:grid-cols-[9rem_1fr] gap-4 py-3 border-b border-border">
      <dt className="font-mono text-xs uppercase tracking-widest text-accent pt-0.5">{term}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}
