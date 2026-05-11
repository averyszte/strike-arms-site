import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";

export default function Cart() {
  return (
    <SiteLayout>
      <Helmet>
        <title>Cart — Strike Arms Airsoft Dublin</title>
        <meta name="description" content="Review your cart and proceed to checkout at Strike Arms Airsoft Dublin." />
        <link rel="canonical" href="https://strikearms.ie/cart" />
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-foreground mb-4">Cart</h1>
        <p className="text-muted-foreground">Coming soon.</p>
      </div>
    </SiteLayout>
  );
}
