import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";
import { HeroLocal } from "@/components/demo/local/hero-local";
import { TrustLocal } from "@/components/demo/local/trust-local";
import { StoryLocal } from "@/components/demo/local/story-local";
import { CategoriesLocal } from "@/components/demo/local/categories-local";
import { WorkbenchLocal } from "@/components/demo/local/workbench-local";
import { ReviewsLocal } from "@/components/demo/local/reviews-local";
import { VisitLocal } from "@/components/demo/local/visit-local";

/**
 * Demo C — "The Local". Warm heritage identity: cream/espresso palette, serif
 * headlines, rounded photography-led cards, calm whitespace, Alan front and
 * centre. Bespoke top-to-bottom — shares no section components with the live
 * Home or demos A/B. The live Home is untouched. noindex.
 */
export default function DemoWorkshop() {
  return (
    <>
      <Helmet>
        <title>Demo C — The Local — Strike Arms (internal preview)</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <SiteLayout>
        <HeroLocal />
        <TrustLocal />
        <StoryLocal />
        <CategoriesLocal />
        <WorkbenchLocal />
        <ReviewsLocal />
        <VisitLocal />
      </SiteLayout>
    </>
  );
}
