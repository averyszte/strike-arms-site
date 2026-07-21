import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { Wrench, Zap, Crosshair, Cog, Hammer, Gauge, ArrowRight, Phone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { SiteLayout } from '@/components/SiteLayout';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, BUSINESS } from '@/lib/site-config';
import { SERVICES, type ServiceIcon } from '@/lib/services';
import { buildItemListSchema, buildBreadcrumbSchema } from '@/lib/structured-data';

const TITLE = 'Airsoft Repairs & Upgrades Dublin | Strike Arms';
const DESCRIPTION =
  'In-house airsoft workshop in Swords, Co. Dublin: repairs, upgrades, hop-up tuning, gearbox rebuilds, custom builds and chrono testing. We diagnose before we quote.';

const ICONS: Record<ServiceIcon, LucideIcon> = {
  wrench: Wrench,
  zap: Zap,
  crosshair: Crosshair,
  cog: Cog,
  hammer: Hammer,
  gauge: Gauge,
};

export default function ServicesHub() {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
  ];

  return (
    <SiteLayout>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/services`} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/services`} />
      </Helmet>
      <JsonLd
        data={[
          buildItemListSchema(SERVICES.map((s) => ({ name: s.title, path: s.path }))),
          buildBreadcrumbSchema(crumbs),
        ]}
      />

      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Airsoft Repairs &amp; Upgrades
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Our workshop is in Swords, Co. Dublin — not in another country. We diagnose a gun before
            we price the job, we replace what is worn rather than everything we stock, and we will
            tell you when a repair is not worth paying for.
          </p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((service) => {
            const Icon = ICONS[service.icon];
            return (
              <Link
                key={service.path}
                href={service.path}
                className="group block rounded-sm border border-border bg-card p-6 hover:border-accent transition-colors"
              >
                <Icon className="h-7 w-7 text-accent" />
                <h2 className="mt-4 text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                  {service.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {service.summary}
                </p>
                <span className="mt-4 flex items-center gap-1 text-sm font-medium text-accent">
                  Read more <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>

        <section className="mt-12 rounded-sm border border-border bg-card p-6 max-w-2xl">
          <h2 className="text-xl font-bold text-foreground">How we quote</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            We diagnose before we price. The fault a customer is certain is a broken gearbox is very
            often a battery, a connector or a fuse — so quoting from a description usually means
            quoting for the wrong job. You get the cost once we know what it actually needs, and
            nothing happens until you agree to it.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Call us on{' '}
            <a
              href={`tel:${BUSINESS.telephone.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
            >
              <Phone className="h-3.5 w-3.5" />
              {BUSINESS.telephone}
            </a>{' '}
            or{' '}
            <Link href="/contact" className="font-medium text-accent hover:underline">
              get in touch
            </Link>
            .
          </p>
        </section>
      </div>
    </SiteLayout>
  );
}
