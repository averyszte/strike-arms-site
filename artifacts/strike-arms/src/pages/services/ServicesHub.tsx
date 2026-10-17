import { ArrowDown, ArrowRight, Cog, Crosshair, Gauge, Hammer, Phone, Wrench, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';

import { JsonLd } from '@/components/JsonLd';
import { SiteLayout } from '@/components/SiteLayout';
import { PageHero } from '@/components/PageHero';
import { ServiceTiles } from '@/components/service/ServiceTiles';
import { SERVICES, type ServiceIcon } from '@/lib/services';
import { BUSINESS, SITE_URL } from '@/lib/site-config';
import {
  CARD_TITLE,
  CONTENT_TITLE,
  CTA_PRIMARY,
  CTA_SECONDARY,
  PAGE_WIDTHS,
  PANEL,
  TEXT_LINK,
  phoneHref,
} from '@/lib/storefront-styles';
import { buildBreadcrumbSchema, buildItemListSchema } from '@/lib/structured-data';

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

const FACTS = [
  { label: 'Where', value: 'Our own bench in Swords, Co. Dublin' },
  { label: 'How we price', value: 'Diagnosed first, quoted second' },
  { label: 'What we replace', value: 'What is worn, not everything we stock' },
];

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

      <PageHero
        crumbs={[{ label: 'Services' }]}
        eyebrow="The workshop"
        title="Airsoft Repairs & Upgrades"
        intro="Our workshop is in Swords, Co. Dublin — not in another country. We diagnose a gun before we price the job, we replace what is worn rather than everything we stock, and we will tell you when a repair is not worth paying for."
        width="medium"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a href="#what-we-do" className={CTA_PRIMARY}>
            See what we do
            <ArrowDown className="h-5 w-5" aria-hidden="true" />
          </a>
          <a href={phoneHref(BUSINESS.telephone)} className={CTA_SECONDARY}>
            <Phone className="h-5 w-5" aria-hidden="true" />
            {BUSINESS.telephone}
          </a>
        </div>

        <ServiceTiles items={FACTS} />
      </PageHero>

      <div className={`mx-auto px-4 py-12 md:px-6 md:py-16 ${PAGE_WIDTHS.medium}`}>
        <section id="what-we-do" className="scroll-mt-28">
          <span aria-hidden="true" className="block h-0.5 w-8 bg-accent" />
          <h2 className={`${CONTENT_TITLE} mt-4`}>
            What we do
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => {
              const Icon = ICONS[service.icon];
              return (
                <Link
                  key={service.path}
                  href={service.path}
                  className={`group flex flex-col ${PANEL} p-6 transition-colors hover:border-accent`}
                >
                  <Icon className="h-7 w-7 text-accent" aria-hidden="true" />
                  <h3 className={`${CARD_TITLE} mt-4 text-lg`}>
                    {service.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {service.summary}
                  </p>
                  <span className="mt-4 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-accent">
                    Read more{' '}
                    <ArrowRight
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className={`mt-14 ${PANEL} p-6 md:p-8`}>
          <h2 className={`${CARD_TITLE} text-xl md:text-2xl`}>How we quote</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            We diagnose before we price. The fault a customer is certain is a broken gearbox is very
            often a battery, a connector or a fuse — so quoting from a description usually means
            quoting for the wrong job. You get the cost once we know what it actually needs, and
            nothing happens until you agree to it.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every service above ends with a short quote form. Tell us what the gun is and what it is
            doing and we will come back with what it is likely to need — that is a quicker first
            answer than a message that only says something is broken.
          </p>
          <p className="mt-6 border-t border-border/60 pt-4 text-sm text-muted-foreground">
            <Phone className="mr-1.5 inline h-4 w-4 align-text-bottom" aria-hidden="true" />
            Prefer to talk? Call us on{' '}
            <a href={phoneHref(BUSINESS.telephone)} className={TEXT_LINK}>
              {BUSINESS.telephone}
            </a>{' '}
            or{' '}
            <Link href="/contact" className={TEXT_LINK}>
              get in touch
            </Link>
            .
          </p>
        </section>
      </div>
    </SiteLayout>
  );
}
