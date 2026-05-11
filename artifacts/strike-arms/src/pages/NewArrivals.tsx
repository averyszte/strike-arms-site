import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";

export default function NewArrivals() {
  return (
    <SiteLayout>
      <Helmet>
        <title>New Arrivals — Strike Arms Airsoft Dublin</title>
        <meta name="description" content="See the latest airsoft guns, gear, and accessories to arrive at Strike Arms Dublin." />
        <link rel="canonical" href="https://strikearms.ie/new" />
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-foreground mb-4">New Arrivals</h1>
        <p className="text-muted-foreground">Coming soon.</p>
      </div>
    </SiteLayout>
  );
}
