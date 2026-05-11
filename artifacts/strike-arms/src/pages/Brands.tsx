import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";

export default function Brands() {
  return (
    <SiteLayout>
      <Helmet>
        <title>Brands — Strike Arms Airsoft Dublin</title>
        <meta name="description" content="Browse all airsoft brands stocked at Strike Arms Dublin, including Tokyo Marui, Krytac, G&G, ICS, and more." />
        <link rel="canonical" href="https://strikearms.ie/brands" />
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-foreground mb-4">Brands</h1>
        <p className="text-muted-foreground">Coming soon.</p>
      </div>
    </SiteLayout>
  );
}
