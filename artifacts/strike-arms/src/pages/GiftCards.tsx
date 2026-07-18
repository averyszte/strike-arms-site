import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";

export default function GiftCards() {
  return (
    <SiteLayout>
      <Helmet>
        <title>Gift Cards — Strike Arms Airsoft Dublin</title>
        <meta name="description" content="Give the gift of airsoft. Strike Arms gift cards are redeemable in-store and online." />
        <link rel="canonical" href="https://strikearms.ie/gift-cards" />
        <meta property="og:title" content="Gift Cards — Strike Arms Airsoft Dublin" />
        <meta property="og:description" content="Give the gift of airsoft. Strike Arms gift cards are redeemable in-store and online." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://strikearms.ie/gift-cards" />
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-foreground mb-4">Gift Cards</h1>
        <p className="text-muted-foreground">Coming soon.</p>
      </div>
    </SiteLayout>
  );
}
