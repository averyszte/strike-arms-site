import { Helmet } from 'react-helmet-async';
import { SiteLayout } from '@/components/SiteLayout';

export default function RepairsServicePage() {
  return (
    <SiteLayout>
      <Helmet>
        <title>Airsoft Repair Services — Strike Arms Airsoft Dublin</title>
        <meta
          name="description"
          content="Professional airsoft repair services at Strike Arms Dublin. AEG, GBB, and sniper rifle servicing by expert technicians."
        />
        <link rel="canonical" href="https://strikearms.ie/services/repairs" />
      </Helmet>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-foreground mb-4">Repair Services</h1>
        <p className="text-muted-foreground">Coming soon.</p>
      </div>
    </SiteLayout>
  );
}
