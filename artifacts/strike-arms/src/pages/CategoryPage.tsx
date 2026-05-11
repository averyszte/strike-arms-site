import { useParams } from "wouter";
import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";
import NotFound from "@/pages/not-found";

const SLUG_MAP: Record<string, string> = {
  rifles: "Airsoft Rifles",
  pistols: "Airsoft Pistols",
  consumables: "Consumables",
  accessories: "Accessories",
  gear: "Tactical Gear",
  "upgrades-repairs": "Upgrades & Repairs",
};

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const displayName = slug ? SLUG_MAP[slug] : undefined;

  if (!displayName) {
    return <NotFound />;
  }

  return (
    <SiteLayout>
      <Helmet>
        <title>{displayName} — Strike Arms Airsoft Dublin</title>
        <meta name="description" content={`Shop ${displayName.toLowerCase()} at Strike Arms Airsoft Dublin.`} />
        <link rel="canonical" href={`https://strikearms.ie/categories/${slug}`} />
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-foreground mb-4">{displayName}</h1>
        <p className="text-muted-foreground">Coming soon.</p>
      </div>
    </SiteLayout>
  );
}
