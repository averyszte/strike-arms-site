import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";

export default function Contact() {
  return (
    <SiteLayout>
      <Helmet>
        <title>Contact &amp; Store Info — Strike Arms Airsoft Dublin</title>
        <meta name="description" content="Get in touch with Strike Arms Airsoft in Dublin. Find our store address, phone number, and opening hours." />
        <link rel="canonical" href="https://strikearms.ie/contact" />
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-foreground mb-4">Contact &amp; Store Info</h1>
        <p className="text-muted-foreground">Coming soon.</p>
      </div>
    </SiteLayout>
  );
}
