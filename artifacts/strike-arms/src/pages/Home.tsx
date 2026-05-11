import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";
import { HeroSection } from "@/components/HeroSection";
import { BrandMarquee } from "@/components/BrandMarquee";
import { CategoryStrip } from "@/components/CategoryStrip";
import { TrustStrip } from "@/components/TrustStrip";
import { ShopByLoadout } from "@/components/ShopByLoadout";
import { WhyBuySection } from "@/components/WhyBuySection";
import { AnnotatedRifleSection } from "@/components/AnnotatedRifleSection";
import { ExpertGuidanceSection } from "@/components/ExpertGuidanceSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { AboutStatsSection } from "@/components/AboutStatsSection";
import { FAQSection } from "@/components/FAQSection";
import { FinalCTASection } from "@/components/FinalCTASection";

const DESCRIPTION =
  "Shop airsoft rifles, pistols, BBs, gas, and tactical gear with expert advice from a Dublin store that knows the equipment inside out.";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Strike Arms Airsoft | Dublin's Home for Airsoft Essentials</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href="https://strikearms.ie/" />
        <meta property="og:title" content="Strike Arms Airsoft | Dublin's Home for Airsoft Essentials" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content="/opengraph.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://strikearms.ie/" />
      </Helmet>
      <SiteLayout>
      <HeroSection />
      <BrandMarquee />
      <CategoryStrip />
      <TrustStrip />
      <ShopByLoadout />
      <WhyBuySection />
      <AnnotatedRifleSection />
      <ExpertGuidanceSection />
      <ReviewsSection />
      <AboutStatsSection />
      <FAQSection />
      <FinalCTASection />
    </SiteLayout>
    </>
  );
}
