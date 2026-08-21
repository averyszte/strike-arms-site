import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";
import { HeroManual } from "@/components/demo/manual/hero-manual";
import { SpecStrip } from "@/components/demo/manual/spec-strip";
import { ArmoryIndex } from "@/components/demo/manual/armory-index";
import { MissionProfiles } from "@/components/demo/manual/mission-profiles";
import { OperatorFile } from "@/components/demo/manual/operator-file";
import { FieldReports } from "@/components/demo/manual/field-reports";
import { FinalOrders } from "@/components/demo/manual/final-orders";

/**
 * Demo A — "Field Manual". A tactical spec-sheet identity: mono type, olive +
 * safety-orange, corner brackets, reticles and numbered sections. Bespoke
 * top-to-bottom — it shares no section components with the live Home or with
 * demos B/C. The live Home is untouched. noindex.
 */
export default function DemoEditorial() {
  return (
    <>
      <Helmet>
        <title>Demo A — Field Manual — Strike Arms (internal preview)</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <SiteLayout>
        <HeroManual />
        <SpecStrip />
        <ArmoryIndex />
        <MissionProfiles />
        <OperatorFile />
        <FieldReports />
        <FinalOrders />
      </SiteLayout>
    </>
  );
}
