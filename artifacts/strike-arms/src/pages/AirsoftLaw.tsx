import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";

export default function AirsoftLaw() {
  return (
    <SiteLayout>
      <Helmet>
        <title>Airsoft Law in Ireland — Strike Arms Airsoft Dublin</title>
        <meta name="description" content="Understand airsoft laws and regulations in Ireland. Strike Arms explains what you need to know before buying and playing." />
        <link rel="canonical" href="https://strikearms.ie/airsoft-law" />
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-foreground mb-4">Airsoft Law in Ireland</h1>
        <p className="text-muted-foreground">Coming soon.</p>
      </div>
    </SiteLayout>
  );
}
