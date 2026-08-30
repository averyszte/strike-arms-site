import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { MapPin, Phone, Clock, Wrench, ExternalLink } from 'lucide-react';

import { SiteLayout } from '@/components/SiteLayout';
import { ContactForm } from '@/components/contact/contact-form';
import { JsonLd } from '@/components/JsonLd';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SITE_URL, BUSINESS } from '@/lib/site-config';
import { buildLocalBusinessSchema, buildBreadcrumbSchema } from '@/lib/structured-data';

const TITLE = 'Contact & Store — Airsoft Shop in Swords, Co. Dublin | Strike Arms';
const DESCRIPTION =
  'Visit Strike Arms, a walk-in airsoft shop in Swords, Co. Dublin. Find our address, phone number and opening hours, and get directions. We ship across Ireland.';

const ADDRESS_LINES = [
  BUSINESS.streetAddress,
  `${BUSINESS.addressLocality}, ${BUSINESS.addressRegion}`,
  BUSINESS.postalCode,
];

const MAPS_QUERY = encodeURIComponent(
  `Strike Arms Airsoft, ${BUSINESS.streetAddress}, ${BUSINESS.addressLocality}, ${BUSINESS.postalCode}`,
);
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;
const TEL_HREF = `tel:${BUSINESS.telephone.replace(/\s/g, '')}`;

export default function Contact() {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <SiteLayout>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/contact`} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/contact`} />
      </Helmet>
      <JsonLd data={[buildLocalBusinessSchema(), buildBreadcrumbSchema(crumbs)]} />

      <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Contact</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="mt-6 text-3xl md:text-4xl font-bold text-foreground">Contact &amp; Store Info</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">
          Strike Arms is a walk-in airsoft shop in Swords, Co. Dublin. Call in for hands-on advice,
          browse the range, or drop a gun off for repairs and upgrades. Prefer to shop from home? We
          ship across Ireland, Republic and Northern Ireland.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <InfoCard icon={<MapPin className="h-5 w-5 text-accent" />} heading="Where to find us">
            <address className="not-italic text-muted-foreground leading-relaxed">
              {ADDRESS_LINES.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center text-sm font-medium text-accent hover:underline"
            >
              Get directions
              <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </InfoCard>

          <InfoCard icon={<Phone className="h-5 w-5 text-accent" />} heading="Call the shop">
            <a href={TEL_HREF} className="text-lg font-semibold text-foreground hover:text-accent">
              {BUSINESS.telephone}
            </a>
            <p className="mt-1 text-sm text-muted-foreground">
              The fastest way to check stock or ask for advice.
            </p>
          </InfoCard>

          <InfoCard icon={<Clock className="h-5 w-5 text-accent" />} heading="Opening hours">
            <dl className="text-muted-foreground">
              <div className="flex justify-between gap-4">
                <dt>Monday</dt>
                <dd>Closed</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Tuesday to Sunday</dt>
                <dd>11:00 to 18:00</dd>
              </div>
            </dl>
          </InfoCard>

          <InfoCard icon={<Wrench className="h-5 w-5 text-accent" />} heading="Repairs &amp; upgrades">
            <p className="text-muted-foreground leading-relaxed">
              Our in-house workshop handles servicing, gearbox rebuilds and upgrades.
            </p>
            <Link
              href="/services/repairs"
              className="mt-3 inline-flex items-center text-sm font-medium text-accent hover:underline"
            >
              See our services
            </Link>
          </InfoCard>
        </div>

        <section className="mt-12 max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground">Send us a message</h2>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            Looking for something we do not have listed, or want a repair quoted before you
            travel? Tell us what you need and we will come back to you. For anything urgent,
            the phone is quicker.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}

function InfoCard({
  icon,
  heading,
  children,
}: {
  icon: React.ReactNode;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="font-semibold text-foreground">{heading}</h2>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
