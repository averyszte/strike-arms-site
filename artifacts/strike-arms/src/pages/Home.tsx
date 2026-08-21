import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";
import { JsonLd } from "@/components/JsonLd";
import {
  buildOrganizationSchema,
  buildWebsiteSchema,
  buildLocalBusinessSchema,
} from "@/lib/structured-data";
import { toAbsoluteUrl } from "@/lib/site-config";
import { HeroSection } from "@/components/HeroSection";
import { BrandMarquee } from "@/components/BrandMarquee";
import { FAQSection } from "@/components/FAQSection";
import { TrustMarquee } from "@/components/demo/combined/trust-marquee";
import { CategoryGrid } from "@/components/demo/combined/category-grid";
import { LoadoutShowcase } from "@/components/demo/combined/loadout-showcase";
import { Lineup } from "@/components/demo/combined/lineup";
import { WhyStrikeArms } from "@/components/demo/combined/why-strike-arms";
import { ReviewsFeature } from "@/components/demo/combined/reviews-feature";
import { FinalCta } from "@/components/demo/combined/final-cta";

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
        <link rel="canonical" href="https://strikearms.ie/" />
        <meta property="og:title" content="Strike Arms Airsoft | Dublin's Home for Airsoft Essentials" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={toAbsoluteUrl("/opengraph.jpg")} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://strikearms.ie/" />
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
        <LoadoutShowcase />
        <WhyStrikeArms />
        <Lineup />
        <ReviewsFeature />
        <FAQSection />
        <FinalCta />
      </SiteLayout>
    </>
  );
}
