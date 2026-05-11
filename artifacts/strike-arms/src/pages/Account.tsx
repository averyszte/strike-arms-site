import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";

export default function Account() {
  return (
    <SiteLayout>
      <Helmet>
        <title>My Account — Strike Arms Airsoft Dublin</title>
        <meta name="description" content="Sign in to your Strike Arms account to view orders, saved items, and account details." />
        <link rel="canonical" href="https://strikearms.ie/account" />
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-foreground mb-4">My Account</h1>
        <p className="text-muted-foreground">Coming soon.</p>
      </div>
    </SiteLayout>
  );
}
