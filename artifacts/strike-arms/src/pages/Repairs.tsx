import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";

export default function Repairs() {
  return (
    <SiteLayout>
      <Helmet>
        <title>Repairs &amp; Upgrades — Strike Arms Airsoft Dublin</title>
        <meta name="description" content="Book a repair or upgrade service at Strike Arms Airsoft Dublin. Expert technicians for AEG, GBB, and sniper rifle servicing." />
        <link rel="canonical" href="https://strikearms.ie/repairs" />
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-foreground mb-4">Repairs &amp; Upgrades</h1>
        <p className="text-muted-foreground">Coming soon.</p>
      </div>
    </SiteLayout>
  );
}
