import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { AlertTriangle, ExternalLink } from 'lucide-react';

import { SiteLayout } from '@/components/SiteLayout';
import { JsonLd } from '@/components/JsonLd';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SITE_URL } from '@/lib/site-config';
import {
  buildArticleSchema,
  buildFaqSchema,
  buildBreadcrumbSchema,
  type FaqItem,
} from '@/lib/structured-data';

const TITLE = 'Airsoft and the Law in Ireland | Strike Arms';
const DESCRIPTION =
  'A plain-English orientation to airsoft and the law in Ireland from a Dublin airsoft shop, with links to the official sources to verify. General information, not legal advice.';
const UPDATED_ISO = '2026-07-19';
const UPDATED_LABEL = 'July 2026';

type Topic = { id: string; heading: string; body: string };

const TOPICS: Topic[] = [
  {
    id: 'is-it-legal',
    heading: 'Is airsoft legal in Ireland?',
    body: 'Airsoft is widely sold and played across Ireland, with organised sites and an established community. How airsoft devices are classified in law, and what conditions apply to buying, owning and using them, is set out in Irish firearms legislation and enforced by An Garda Siochana. Because the detail matters and can change, confirm the current position with the official sources below rather than relying on second-hand accounts or UK rules, which are different.',
  },
  {
    id: 'age-and-buying',
    heading: 'Age and buying',
    body: 'Retailers apply age checks and their own policies when selling airsoft. Exactly who may buy and own an airsoft device is a legal question rather than a shop preference, so if you are buying for yourself or a younger player, check the current requirements with the official sources or ask us before you order.',
  },
  {
    id: 'rif-two-tone',
    heading: 'Realistic imitation firearms and two-tone',
    body: 'You will come across the terms "realistic imitation firearm" (RIF) and "two-tone" when researching airsoft. These relate to how a replica looks and how it is treated in law, and the rules are not the same as in the UK. It is worth understanding the Irish position before you buy a particular finish or style, so read the legislation and Garda guidance linked below.',
  },
  {
    id: 'importing',
    heading: 'Importing and buying from abroad',
    body: 'Ordering airsoft from outside Ireland can bring customs, VAT and possible restriction considerations, and packages can be held or refused. Before importing, check Revenue guidance on bringing goods into the country and the carrier’s own rules. Buying from an Irish shop avoids most of this, and we are here if you have a question.',
  },
  {
    id: 'transport',
    heading: 'Transporting your airsoft gun',
    body: 'As a matter of good practice, carry an airsoft gun discreetly and securely: cased or bagged, unloaded, and out of public view when travelling to and from a site. Openly carrying or displaying a realistic replica in a public place can cause genuine alarm and draw a response, so treat it with the same care you would any replica firearm.',
  },
  {
    id: 'power-and-sites',
    heading: 'Power limits and sites',
    body: 'Airsoft sites set and enforce their own muzzle-energy limits by gun role, and will chronograph your gun before play. Separately, how a gun’s power relates to its legal classification is a point to verify rather than assume. Our FPS and joules guide explains how power is measured; always check your site’s current limits and, for the legal side, the official sources.',
  },
];

type Source = { name: string; url: string; note: string };

const SOURCES: Source[] = [
  {
    name: 'An Garda Siochana',
    url: 'https://www.garda.ie/',
    note: 'Firearms and imitation firearms: official guidance and enforcement.',
  },
  {
    name: 'Irish Statute Book',
    url: 'https://www.irishstatutebook.ie/',
    note: 'The Firearms Acts and the Criminal Justice Act 2006: the primary legislation.',
  },
  {
    name: 'Revenue',
    url: 'https://www.revenue.ie/',
    note: 'Importing goods, customs and VAT when buying from abroad.',
  },
];

const FAQ: FaqItem[] = [
  {
    question: 'Is airsoft legal in Ireland?',
    answer:
      'Airsoft is widely sold and played across Ireland. How devices are classified and what conditions apply is set out in Irish firearms legislation and enforced by An Garda Siochana; confirm the current detail with the official sources before you buy or play, as UK rules do not apply.',
  },
  {
    question: 'Can I import an airsoft gun into Ireland?',
    answer:
      'Importing can involve customs, VAT and possible restrictions, and packages can be held or refused. Check Revenue guidance and the carrier rules first. Buying from an Irish shop avoids most of this.',
  },
  {
    question: 'How should I transport an airsoft gun?',
    answer:
      'As good practice, carry it cased or bagged, unloaded and out of public view. Openly displaying a realistic replica in public can cause alarm.',
  },
];

export default function AirsoftLaw() {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Airsoft Law', path: '/airsoft-law' },
  ];

  return (
    <SiteLayout>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/airsoft-law`} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${SITE_URL}/airsoft-law`} />
      </Helmet>
      <JsonLd
        data={[
          buildArticleSchema({ title: TITLE, description: DESCRIPTION, path: '/airsoft-law', isoDate: UPDATED_ISO }),
          buildFaqSchema(FAQ),
          buildBreadcrumbSchema(crumbs),
        ]}
      />

      <div className="max-w-[760px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Airsoft Law</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="mt-6 text-3xl md:text-4xl font-bold text-foreground">
          Airsoft and the Law in Ireland
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Last reviewed: {UPDATED_LABEL}</p>

        <Disclaimer />

        <p className="mt-6 text-lg text-foreground leading-relaxed">
          Airsoft is a popular, well-established sport in Ireland, but the questions around the law
          come up a lot in the shop. This page gives you an honest starting point and, just as
          importantly, points you to the official sources for the answers that matter.
        </p>

        <div className="mt-8 space-y-8">
          {TOPICS.map((topic) => (
            <section key={topic.id} id={topic.id}>
              <h2 className="text-2xl font-bold text-foreground">{topic.heading}</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">{topic.body}</p>
            </section>
          ))}
        </div>

        <SourcesBlock />

        <p className="mt-8 text-muted-foreground leading-relaxed">
          Still not sure? It is what we are here for. Call in or{' '}
          <Link href="/contact" className="font-medium text-accent hover:underline">
            get in touch
          </Link>
          , and read our{' '}
          <Link href="/guides/fps-and-joules-explained" className="font-medium text-accent hover:underline">
            FPS and joules guide
          </Link>{' '}
          for the power side of things.
        </p>
      </div>
    </SiteLayout>
  );
}

function Disclaimer() {
  return (
    <div className="mt-5 flex gap-3 rounded-sm border border-border bg-card p-4">
      <AlertTriangle className="h-5 w-5 shrink-0 text-accent" />
      <p className="text-sm text-muted-foreground leading-relaxed">
        This page is general orientation from an airsoft retailer, not legal advice. Airsoft and
        firearms law is specific and can change, so always confirm the current position with the
        official sources below, or ask us in the shop, before you buy, import, transport or play. We
        do not state the law here as settled fact.
      </p>
    </div>
  );
}

function SourcesBlock() {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-foreground">Where to check: official sources</h2>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        For anything that matters, these are the authorities to rely on rather than forum posts or
        shop opinion, ours included.
      </p>
      <ul className="mt-4 space-y-3">
        {SOURCES.map((source) => (
          <li key={source.url} className="rounded-sm border border-border bg-card p-4">
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center font-semibold text-accent hover:underline"
            >
              {source.name}
              <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
            <p className="mt-1 text-sm text-muted-foreground">{source.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
