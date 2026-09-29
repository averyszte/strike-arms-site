import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/lib/site-config";
import { Link } from "wouter";

import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import { CTA_SECONDARY_SM } from "@/lib/storefront-styles";

export default function GiftCards() {
  return (
    <SiteLayout>
      <Helmet>
        <title>Gift Cards — Strike Arms Airsoft Dublin</title>
        <meta name="description" content="Give the gift of airsoft. Strike Arms gift cards are redeemable in-store and online." />
        <link rel="canonical" href={`${SITE_URL}/gift-cards`} />
        <meta property="og:title" content="Gift Cards — Strike Arms Airsoft Dublin" />
        <meta property="og:description" content="Give the gift of airsoft. Strike Arms gift cards are redeemable in-store and online." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/gift-cards`} />
      </Helmet>
      <PageHero
        crumbs={[{ label: "Gift cards" }]}
        eyebrow="Gift cards"
        title="Gift Cards"
        intro="Coming soon."
        isCompact
      >
        <Link href="/contact" className={CTA_SECONDARY_SM}>
          Ask in store
        </Link>
      </PageHero>
    </SiteLayout>
  );
}
