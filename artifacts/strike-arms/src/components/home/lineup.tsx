import { Link } from "wouter";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { GUIDES, type GuideSummary } from "@/lib/guides";
import { publicImageSrcSet } from "@/lib/public-image-srcset";

/**
 * Combined homepage — the guides, as Drop's big numbered photo cards on the
 * site's dark tokens with an asymmetric middle card. Titles, summaries and
 * links come from the guides registry, so they always match /guides.
 */
const BEGINNERS_IMG = "/images/guides/beginners-guide.webp";
const FIRST_GUN_IMG = "/images/guides/choosing-your-first-gun.webp";

/** The maintenance photo is only 640 px wide, so it has no smaller copy. */
const FEATURED: { path: string; img: string; srcSet?: string }[] = [
  { path: "/guides/beginners-guide", img: BEGINNERS_IMG, srcSet: publicImageSrcSet(BEGINNERS_IMG, [640], 1122) },
  { path: "/guides/first-airsoft-gun", img: FIRST_GUN_IMG, srcSet: publicImageSrcSet(FIRST_GUN_IMG, [640], 1122) },
  { path: "/guides/airsoft-maintenance", img: "/images/guides/maintenance-guide.webp" },
];

const CARDS = FEATURED.flatMap(({ path, img, srcSet }) => {
  const guide = GUIDES.find((g) => g.path === path);
  return guide ? [{ guide, img, srcSet }] : [];
});

type GuideCardProps = { guide: GuideSummary; img: string; srcSet?: string; index: number };

function GuideCard({ guide, img, srcSet, index }: GuideCardProps) {
  return (
    <Link href={guide.path} className={`group flex flex-col ${index === 1 ? "md:mt-10" : ""}`}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-background">
        <img
          src={img}
          srcSet={srcSet}
          sizes={srcSet ? "(min-width: 768px) 33vw, 100vw" : undefined}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
        <span className="absolute top-1 left-4 font-black text-7xl md:text-8xl text-foreground leading-none mix-blend-difference">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="absolute bottom-4 left-4 text-[11px] font-black uppercase tracking-[0.2em] text-accent">
          {guide.group}
        </span>
      </div>
      <div className="flex items-start justify-between gap-3 pt-4">
        <div>
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground leading-none group-hover:text-accent transition-colors">
            {guide.navLabel}
          </h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{guide.summary}</p>
        </div>
        <ArrowUpRight className="w-6 h-6 shrink-0 mt-1 text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </div>
    </Link>
  );
}

export function Lineup() {
  return (
    <section className="py-16 md:py-24 bg-card border-y border-border/60">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 md:mb-14 gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-3">
              Advice from the counter
            </p>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[1.02]">
              Airsoft
              <br />
              guides
            </h2>
          </div>
          <div className="flex flex-col gap-4 md:items-end max-w-sm">
            <p className="text-base text-muted-foreground md:text-right">
              Clear, no-nonsense advice from the team at Strike Arms. New to airsoft or
              upgrading your kit? Start here.
            </p>
            <Link
              href="/guides"
              className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground hover:text-accent transition-colors"
            >
              All guides
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {CARDS.map((card, i) => (
            <GuideCard key={card.guide.path} guide={card.guide} img={card.img} srcSet={card.srcSet} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
