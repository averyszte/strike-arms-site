import { Helmet } from 'react-helmet-async';
import { SiteLayout } from '@/components/SiteLayout';

export default function UpgradesServicePage() {
  return (
    <SiteLayout>
      <Helmet>
        <title>Airsoft Upgrade Services — Strike Arms Airsoft Dublin</title>
        <meta
          name="description"
          content="Expert airsoft upgrade services at Strike Arms Dublin. FPS tuning, hop-up setup, trigger jobs, and full custom builds."
        />
        <link rel="canonical" href="https://strikearms.ie/services/upgrades" />
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-foreground mb-4">Upgrade Services</h1>
        <p className="text-muted-foreground">Coming soon.</p>
      </div>
    </SiteLayout>
  );
}
