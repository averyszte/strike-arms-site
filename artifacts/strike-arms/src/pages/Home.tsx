import { UtilityBar } from "@/components/UtilityBar";
import { SiteHeader } from "@/components/SiteHeader";
import { HeroSection } from "@/components/HeroSection";
import { BrandMarquee } from "@/components/BrandMarquee";
import { CategoryStrip } from "@/components/CategoryStrip";
import { TrustStrip } from "@/components/TrustStrip";
import { ShopByLoadout } from "@/components/ShopByLoadout";
import { WhyBuySection } from "@/components/WhyBuySection";
import { PromoBannerSection } from "@/components/PromoBannerSection";
import { AnnotatedRifleSection } from "@/components/AnnotatedRifleSection";
import { ExpertGuidanceSection } from "@/components/ExpertGuidanceSection";
import { ReviewsSection } from "@/components/ReviewsSection";
import { AboutStatsSection } from "@/components/AboutStatsSection";
import { FAQSection } from "@/components/FAQSection";
import { FinalCTASection } from "@/components/FinalCTASection";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileStickyBar } from "@/components/MobileStickyBar";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      {/* Sticky header block — utility bar + main header stick together */}
      <div className="sticky top-0 z-50">
        <UtilityBar />
        <SiteHeader />
      </div>

      <main className="flex-1">
        <HeroSection />
        <BrandMarquee />
        <CategoryStrip />
        <TrustStrip />
        <ShopByLoadout />
        <WhyBuySection />
        <PromoBannerSection />
        <AnnotatedRifleSection />
        <ExpertGuidanceSection />
        <ReviewsSection />
        <AboutStatsSection />
        <FAQSection />
        <FinalCTASection />
      </main>

      <SiteFooter />
      <MobileStickyBar />
    </div>
  );
}
