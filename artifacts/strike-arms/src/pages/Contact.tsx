import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { MapPin, Phone, Clock, Wrench, ExternalLink } from 'lucide-react';

import { SiteLayout } from '@/components/SiteLayout';
import { ContactForm } from '@/components/contact/contact-form';
import { JsonLd } from '@/components/JsonLd';
import { PageHero } from '@/components/PageHero';
import { SITE_URL, BUSINESS } from '@/lib/site-config';
import { buildLocalBusinessSchema, buildBreadcrumbSchema } from '@/lib/structured-data';
import {
  CARD_TITLE,
  CONTENT_TITLE,
  PAGE_WIDTHS,
  PANEL,
  TEXT_LINK,
  phoneHref,
} from '@/lib/storefront-styles';

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
const TEL_HREF = phoneHref(BUSINESS.telephone);

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

      <PageHero
        crumbs={[{ label: 'Contact' }]}
        eyebrow="Visit the shop"
        title="Contact & Store Info"
        intro="Strike Arms is a walk-in airsoft shop in Swords, Co. Dublin. Call in for hands-on advice, browse the range, or drop a gun off for repairs and upgrades. Prefer to shop from home? We ship across Ireland, Republic and Northern Ireland."
        width="medium"
      />

      <div className={`mx-auto px-4 md:px-6 py-12 md:py-16 ${PAGE_WIDTHS.medium}`}>
        <div className="grid gap-6 md:grid-cols-2">
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
              className={`mt-3 inline-flex items-center text-sm ${TEXT_LINK}`}
            >
              Get directions
              <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </InfoCard>

          <InfoCard icon={<Phone className="h-5 w-5 text-accent" />} heading="Call the shop">
            <a
              href={TEL_HREF}
              className="text-2xl md:text-3xl font-black tracking-tight text-foreground transition-colors hover:text-accent"
            >
              {BUSINESS.telephone}
            </a>
            <p className="mt-1 text-sm text-muted-foreground">
              The fastest way to check stock or ask for advice.
            </p>
          </InfoCard>

          <InfoCard icon={<Clock className="h-5 w-5 text-accent" />} heading="Opening hours">
            <dl className="space-y-1 text-muted-foreground">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Monday</dt>
                <dd className="font-bold text-foreground">Closed</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Tuesday to Sunday
                </dt>
                <dd className="font-bold text-foreground">11:00 to 18:00</dd>
              </div>
            </dl>
          </InfoCard>

          <InfoCard icon={<Wrench className="h-5 w-5 text-accent" />} heading="Repairs &amp; upgrades">
            <p className="text-muted-foreground leading-relaxed">
              Our in-house workshop handles servicing, gearbox rebuilds and upgrades.
            </p>
            <Link
              href="/services/repairs"
              className={`mt-3 inline-flex items-center text-sm ${TEXT_LINK}`}
            >
              See our services
            </Link>
          </InfoCard>
        </div>

        <section className="mt-16 max-w-2xl">
          <h2 className={CONTENT_TITLE}>Send us a message</h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
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
    <div className={`${PANEL} p-6 transition-colors hover:border-accent`}>
      <div className="flex items-center gap-2">
        {icon}
        <h2 className={`${CARD_TITLE} text-lg`}>{heading}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
