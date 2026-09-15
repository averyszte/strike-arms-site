import { ArrowDown, ArrowRight, Cog, Crosshair, Gauge, Hammer, Phone, Wrench, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';

import { JsonLd } from '@/components/JsonLd';
import { SiteLayout } from '@/components/SiteLayout';
import { ServiceTiles } from '@/components/service/ServiceTiles';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { SERVICES, type ServiceIcon } from '@/lib/services';
import { BUSINESS, SITE_URL } from '@/lib/site-config';
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

      <section className="relative overflow-hidden border-b border-border bg-card">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-14">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Services</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            The workshop
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-[1.15] text-foreground md:text-[2.75rem]">
            Airsoft Repairs &amp; Upgrades
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-foreground/90">
            Our workshop is in Swords, Co. Dublin — not in another country. We diagnose a gun before
            we price the job, we replace what is worn rather than everything we stock, and we will
            tell you when a repair is not worth paying for.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="#what-we-do">
                See what we do
                <ArrowDown aria-hidden="true" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={`tel:${BUSINESS.telephone.replace(/\s/g, '')}`}>
                <Phone aria-hidden="true" />
                {BUSINESS.telephone}
              </a>
            </Button>
          </div>

          <ServiceTiles items={FACTS} />
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <section id="what-we-do" className="scroll-mt-28">
          <span aria-hidden="true" className="block h-0.5 w-8 bg-accent" />
          <h2 className="mt-4 text-2xl font-bold leading-tight text-foreground md:text-[1.75rem]">
            What we do
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => {
              const Icon = ICONS[service.icon];
              return (
                <Link
                  key={service.path}
                  href={service.path}
                  className="group flex flex-col rounded-sm border border-border bg-card p-6 transition-colors hover:border-accent"
                >
                  <Icon className="h-7 w-7 text-accent" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-bold text-foreground transition-colors group-hover:text-accent">
                    {service.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {service.summary}
                  </p>
                  <span className="mt-4 flex items-center gap-1 text-sm font-medium text-accent">
                    Read more <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-14 rounded-sm border border-border bg-card p-6 md:p-8">
          <h2 className="text-xl font-bold text-foreground">How we quote</h2>
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
          <p className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground">
            <Phone className="mr-1.5 inline h-4 w-4 align-text-bottom" aria-hidden="true" />
            Prefer to talk? Call us on{' '}
            <a
              href={`tel:${BUSINESS.telephone.replace(/\s/g, '')}`}
              className="font-medium text-accent hover:underline"
            >
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
