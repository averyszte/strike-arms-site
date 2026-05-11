import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";

export default function Sale() {
  return (
    <SiteLayout>
      <Helmet>
        <title>Sale — Strike Arms Airsoft Dublin</title>
        <meta name="description" content="Shop discounted airsoft rifles, pistols, gear, and accessories in the Strike Arms sale." />
        <link rel="canonical" href="https://strikearms.ie/sale" />
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-foreground mb-4">Sale</h1>
        <p className="text-muted-foreground">Coming soon.</p>
      </div>
    </SiteLayout>
  );
}
