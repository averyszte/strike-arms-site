import { Link } from "wouter";
import {
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  BatteryFull,
  Check,
  CircleDot,
  Crosshair,
  Glasses,
  ImageOff,
  PlugZap,
  type LucideIcon,
} from "lucide-react";
import {
  EVOLUTION_DRAFT_RIFLES,
  EVOLUTION_RANGE_LABELS,
  RECON_SPEC_POINTS,
  type EvolutionDraftRifle,
} from "@/lib/evolution-draft-data";
import { formatPrice } from "@/lib/format-price";

/**
 * Evolution featured-section drafts, direction D: "brand takeover". Loud,
 * poster-like treatments of Alan's main line. No product photos exist yet, so
 * every image slot is a marked placeholder. Prices come only from the draft data.
 */

const RANGE_HREF = "/brands/evolution";
const FROM_CENTS = Math.min(...EVOLUTION_DRAFT_RIFLES.map((r) => r.priceCents));
const FROM_LABEL = formatPrice(FROM_CENTS).replace(/\.00$/, "");

function productHref(rifle: EvolutionDraftRifle): string {
  return `/products/${rifle.slug}`;
}

/** Drops the brand prefix, since the section already shouts it. */
function modelName(rifle: EvolutionDraftRifle): string {
  return rifle.name.replace(/^Evolution\s+/, "");
}

function indexLabel(i: number): string {
  return String(i + 1).padStart(2, "0");
}

function PhotoPlaceholder({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-muted text-muted-foreground flex flex-col items-center justify-center gap-2 ${className}`}>
      <ImageOff className="w-6 h-6 opacity-60" />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Photo to come</span>
    </div>
  );
}

/* ------------------------------------------------------------------ D1 */

function PosterTile({ rifle }: { rifle: EvolutionDraftRifle }) {
  return (
    <Link
      href={productHref(rifle)}
      className="group flex flex-col bg-background text-foreground border border-background hover:border-foreground transition-colors"
    >
      <PhotoPlaceholder className="aspect-[4/3]" />
      <div className="flex flex-col gap-2 p-4 flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-accent">
          {EVOLUTION_RANGE_LABELS[rifle.range]}
        </p>
        <h3 className="text-base font-black uppercase tracking-tight leading-tight group-hover:text-accent transition-colors">
          {modelName(rifle)}
        </h3>
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-border">
          <span className="text-lg font-black">{formatPrice(rifle.priceCents)}</span>
          <ArrowUpRight className="w-5 h-5 text-accent opacity-60 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
}

function PosterHeadline() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
      <div className="min-w-0">
        <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
          <Asterisk className="w-4 h-4" strokeWidth={3} /> Alan's pick of the shop
        </p>
        <h2 className="font-black uppercase tracking-tighter leading-[0.8] text-[17vw] lg:text-[11rem] xl:text-[13rem] break-words">
          Evolution
        </h2>
      </div>
      <div className="shrink-0 flex flex-col items-start lg:items-end gap-4 lg:pb-4">
        <p className="leading-none">
          <span className="block text-sm font-black uppercase tracking-[0.25em]">Rifles from</span>
          <span className="block text-7xl md:text-8xl font-black tracking-tighter">{FROM_LABEL}</span>
        </p>
        <Link
          href={RANGE_HREF}
          className="group h-14 px-8 inline-flex items-center gap-2 bg-background text-foreground font-black uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
        >
          See the full range
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

/** D1: the accent band takes over the page, a poster-size EVOLUTION, all seven rifles below. */
export function EvolutionDraftD1() {
  return (
    <section className="bg-accent text-accent-foreground overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <PosterHeadline />
        <div className="mt-6 py-3 border-y-2 border-current flex flex-wrap gap-x-6 gap-y-1 text-xs md:text-sm font-black uppercase tracking-wider">
          {Object.values(EVOLUTION_RANGE_LABELS).map((label) => (
            <span key={label}>{label}</span>
          ))}
          <span className="ml-auto">{EVOLUTION_DRAFT_RIFLES.length} rifles</span>
        </div>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2 md:gap-3">
          {EVOLUTION_DRAFT_RIFLES.map((rifle) => (
            <PosterTile key={rifle.slug} rifle={rifle} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ D2 */

const KIT_ITEMS: { icon: LucideIcon; label: string }[] = [
  { icon: Crosshair, label: "Evolution Recon rifle" },
  { icon: BatteryFull, label: "Battery" },
  { icon: PlugZap, label: "Charger" },
  { icon: CircleDot, label: "BBs" },
  { icon: Glasses, label: "Eye protection" },
];

function DropCard({ rifle, index, isClone }: { rifle: EvolutionDraftRifle; index: number; isClone: boolean }) {
  return (
    <Link
      href={productHref(rifle)}
      aria-hidden={isClone}
      tabIndex={isClone ? -1 : undefined}
      className="group relative w-[19rem] md:w-[22rem] shrink-0 bg-card border border-border hover:border-accent transition-colors flex flex-col"
    >
      <span className="absolute top-2 left-4 z-10 text-7xl md:text-8xl font-black tracking-tighter leading-none text-foreground/90 group-hover:text-accent transition-colors">
        {indexLabel(index)}
      </span>
      <PhotoPlaceholder className="aspect-[4/3] pt-16" />
      <div className="p-5 flex flex-col gap-2 flex-1">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-accent">
          {EVOLUTION_RANGE_LABELS[rifle.range]} · {rifle.supplierCode}
        </p>
        <h3 className="text-lg font-black uppercase tracking-tight leading-tight whitespace-normal">
          {modelName(rifle)}
        </h3>
        <p className="text-sm text-muted-foreground whitespace-normal">{rifle.short}</p>
        <p className="mt-auto pt-3 text-2xl font-black">{formatPrice(rifle.priceCents)}</p>
      </div>
    </Link>
  );
}

function DropMarquee() {
  const count = EVOLUTION_DRAFT_RIFLES.length;
  const loop = [...EVOLUTION_DRAFT_RIFLES, ...EVOLUTION_DRAFT_RIFLES, ...EVOLUTION_DRAFT_RIFLES];
  return (
    <div className="overflow-hidden group/marquee">
      <div
        className="flex w-max gap-4 animate-marquee group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: "60s" }}
      >
        {loop.map((rifle, i) => (
          <DropCard key={`${rifle.slug}-${i}`} rifle={rifle} index={i % count} isClone={i >= count} />
        ))}
      </div>
    </div>
  );
}

function StarterKit() {
  return (
    <div className="grid lg:grid-cols-[1.1fr_1fr] border-2 border-accent">
      <div className="p-6 md:p-10 flex flex-col gap-6">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-accent">New to airsoft?</p>
        <h3 className="-mt-3 text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.9]">
          Recon <span className="text-accent">starter kit</span>
        </h3>
        <ul className="grid sm:grid-cols-2 gap-3">
          {KIT_ITEMS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 font-black uppercase tracking-tight">
              <span className="w-10 h-10 shrink-0 bg-accent text-accent-foreground flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </span>
              {label}
            </li>
          ))}
        </ul>
        <div className="border-t border-border pt-5">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Every Recon comes with
          </p>
          <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            {RECON_SPEC_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 text-accent shrink-0" /> {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="bg-accent text-accent-foreground p-6 md:p-10 flex flex-col justify-between gap-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em]">Kit price</p>
          <p className="mt-3 text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85] border-2 border-dashed border-current p-4">
            Price from Alan
          </p>
          <p className="mt-3 text-sm font-bold">Placeholder until Alan confirms the bundle.</p>
        </div>
        <Link
          href={RANGE_HREF}
          className="group h-14 px-8 self-start inline-flex items-center gap-2 bg-background text-foreground font-black uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
        >
          Pick your Recon
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

/** D2: a dark drop-style marquee with big index numbers, then a Recon starter kit call-out. */
export function EvolutionDraftD2() {
  return (
    <section className="py-16 md:py-24 bg-background border-y border-border overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-3">
            The drop / {indexLabel(EVOLUTION_DRAFT_RIFLES.length - 1)} rifles
          </p>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-[0.88]">
            Evolution,
            <br />
            <span className="text-accent">front of house</span>
          </h2>
        </div>
        <Link
          href={RANGE_HREF}
          className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-accent hover:underline"
        >
          Shop the range <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
      <DropMarquee />
      <div className="container mx-auto px-4 md:px-6 mt-14 md:mt-20">
        <StarterKit />
      </div>
    </section>
  );
}
