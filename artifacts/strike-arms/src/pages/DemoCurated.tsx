import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";
import { HeroDrop } from "@/components/demo/drop/hero-drop";
import { DropMarquee } from "@/components/demo/drop/drop-marquee";
import { Lineup } from "@/components/demo/drop/lineup";
import { CategoryBlocks } from "@/components/demo/drop/category-blocks";
import { AlanStatement } from "@/components/demo/drop/alan-statement";
import { DropReviews } from "@/components/demo/drop/drop-reviews";
import { FinalDrop } from "@/components/demo/drop/final-drop";

/**
 * Demo B — "Drop". Streetwear-drop identity: oversized display type, marquee
 * bands, edge-to-edge imagery, stark black/off-white + safety orange. Bespoke
 * top-to-bottom — shares no section components with the live Home or demos A/C.
 * The live Home is untouched. noindex.
 */
export default function DemoCurated() {
  return (
    <>
      <Helmet>
        <title>Demo B — Drop — Strike Arms (internal preview)</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <SiteLayout>
        <HeroDrop />
        <DropMarquee
          items={["In stock now", "Walk-in welcome", "In-house repairs", "Swords, Dublin"]}
        />
        <Lineup />
        <CategoryBlocks />
        <AlanStatement />
        <DropMarquee variant="light" items={["Gear up", "Play more", "Ask Alan"]} />
        <DropReviews />
        <FinalDrop />
      </SiteLayout>
    </>
  );
}
