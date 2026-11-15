import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";
import { JsonLd } from "@/components/JsonLd";
import {
  buildOrganizationSchema,
  buildWebsiteSchema,
  buildLocalBusinessSchema,
} from "@/lib/structured-data";
import { SITE_URL, toAbsoluteUrl } from "@/lib/site-config";
import { HeroSection } from "@/components/HeroSection";
import { BrandMarquee } from "@/components/BrandMarquee";
import { FAQSection } from "@/components/FAQSection";
import { TrustMarquee } from "@/components/home/trust-marquee";
import { CategoryGrid } from "@/components/home/category-grid";
import { Lineup } from "@/components/home/lineup";
import { ReviewsFeature } from "@/components/home/reviews-feature";
import { FinalCta } from "@/components/home/final-cta";
import { VisitShop } from "@/components/home/visit-shop";

// Below the fold, and the only home sections that animate with framer-motion,
// so they are their own chunks and framer-motion stays out of the entry
// chunk every first visit downloads (N-031). The rest of the page is plain
// markup and stays eager, so in-page anchors such as #visit exist at once.
// Both come from one module (components/home/motion-sections.tsx), so one chunk.
const EvolutionBand = lazy(() =>
  import("@/components/home/motion-sections").then((m) => ({ default: m.EvolutionBandSection })),
);
const LoadoutShowcase = lazy(() =>
  import("@/components/home/motion-sections").then((m) => ({ default: m.LoadoutShowcaseSection })),
);

/** Holds roughly the showcase's height while its chunk loads. */
const LOADOUT_FALLBACK = <div className="min-h-[56rem] lg:min-h-[44rem]" aria-busy="true" />;

const DESCRIPTION =
  "Shop airsoft rifles, pistols, BBs, gas, and tactical gear with expert advice from a Dublin store that knows the equipment inside out.";

/**
 * Homepage — the "Combined" (Direction D) design promoted from /demo-combined.
 * The live site's substance with the Drop demo's creativity at ~60%, on the
 * site's real design tokens. The brighter accent, squared corners, and hero
 * type overrides are applied through the scoped `.theme-drop` wrapper so only
 * this page adopts them; every other route keeps the original look.
 */
export default function Home() {
  return (
    <>
      <Helmet>
        <title>Strike Arms Airsoft | Dublin's Home for Airsoft Essentials</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <meta property="og:title" content="Strike Arms Airsoft | Dublin's Home for Airsoft Essentials" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={toAbsoluteUrl("/opengraph.jpg")} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/`} />
      </Helmet>
      <JsonLd
        data={[
          buildOrganizationSchema(),
          buildWebsiteSchema(),
          buildLocalBusinessSchema(),
        ]}
      />
      <SiteLayout className="theme-drop">
        <HeroSection />
        <TrustMarquee />
        {/* Brand strip sits under the trust strip and scrolls the opposite way —
            the wrapper flips the shared marquee's direction (scoped CSS). */}
        <div className="brands-reverse">
          <BrandMarquee />
        </div>
        <CategoryGrid />
        {/* Hidden until an Evolution rifle is published, so it holds no
            space while loading either. */}
        <Suspense fallback={null}>
          <EvolutionBand />
        </Suspense>
        <Suspense fallback={LOADOUT_FALLBACK}>
          <LoadoutShowcase />
        </Suspense>
        <Lineup />
        <ReviewsFeature />
        <VisitShop />
        <FAQSection />
        <FinalCta />
      </SiteLayout>
    </>
  );
}
