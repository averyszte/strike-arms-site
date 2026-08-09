import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";
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

/**
 * Demo D — "Combined". The live homepage's substance with the Drop demo's
 * creativity dialled to ~60%, on the site's real design tokens. Consolidated to
 * a single store section (WhyStrikeArms; AboutStats cut, WhyBuy + ExpertGuidance
 * merged, Workbench dropped). Internal preview only — noindex, live Home
 * untouched.
 */
export default function DemoCombined() {
  return (
    <>
      <Helmet>
        <title>Demo D — Combined | Strike Arms (internal preview)</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <SiteLayout className="theme-drop">
        <HeroSection />
        <TrustMarquee />
        {/* Brand strip sits right under the trust strip and scrolls the opposite
            way — the wrapper flips the shared marquee's direction, demo-only. */}
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
