import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";

/**
 * Demo index at /demo — an internal review hub linking the three homepage
 * directions. The live homepage (@/pages/Home) and its section components are
 * NOT touched; every redesign lives under @/components/demo and the DemoX
 * pages. noindex so none of this reaches search.
 */
const demos = [
  {
    href: "/demo-editorial",
    tag: "Direction A",
    title: "Field Manual",
    blurb:
      "Tactical spec-sheet. Monospace type, olive and safety-orange, corner brackets, reticles and numbered sections — the armory index, mission profiles, an operator file on Alan. Reads like a weapon manual. Boldest, most on-theme.",
  },
  {
    href: "/demo-curated",
    tag: "Direction B",
    title: "Drop",
    blurb:
      "Streetwear-drop energy. Oversized display type bleeding to the edges, scrolling marquee bands, edge-to-edge imagery, stark black and off-white with orange. Loud and modern — reads like a product drop.",
  },
  {
    href: "/demo-workshop",
    tag: "Direction C",
    title: "The Local",
    blurb:
      "Warm heritage. Cream and espresso palette, serif headlines, rounded photography-led cards, calm whitespace and Alan front and centre. The human, welcoming cut — reads like a trusted local craftsman.",
  },
];

export default function HomeDemo() {
  return (
    <>
      <Helmet>
        <title>Homepage demos — Strike Arms (internal preview)</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <SiteLayout>
        <section className="max-w-[1100px] mx-auto px-4 md:px-6 py-16 md:py-24">
          <span className="inline-block text-accent text-xs font-bold tracking-[0.2em] uppercase mb-4">
            Internal preview
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Homepage directions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-12">
            Three takes on everything below the hero, each built from a different
            research camp — plus a combined cut that merges the live homepage's
            substance with the Drop's creativity. Open each, then tell me which
            to take forward. The live homepage is untouched.
          </p>

          {/* Featured — the combined direction */}
          <Link
            href="/demo-combined"
            className="group flex flex-col md:flex-row md:items-center gap-6 rounded-sm border border-accent/60 bg-card p-6 md:p-8 mb-8 hover:border-accent transition-colors"
          >
            <div className="flex-1">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-accent mb-3 block">
                Recommended · Direction D
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Combined
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
                The live homepage rebuilt on its own dark tactical tokens with the
                Drop demo's creativity at about 60% — bolder type, an animated
                trust band, Alan's lineup replacing the invented product, and a
                merged "why us" section. Twelve sections consolidated to eleven.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-accent shrink-0">
              View
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {demos.map((demo) => (
              <Link
                key={demo.href}
                href={demo.href}
                className="group flex flex-col rounded-sm border border-border/60 bg-card p-6 hover:border-accent transition-colors"
              >
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground mb-3">
                  {demo.tag}
                </span>
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  {demo.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                  {demo.blurb}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-accent">
                  View
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </SiteLayout>
    </>
  );
}
