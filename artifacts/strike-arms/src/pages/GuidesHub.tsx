import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { ArrowUpRight, BookOpen } from 'lucide-react';

import { SiteLayout } from '@/components/SiteLayout';
import { JsonLd } from '@/components/JsonLd';
import { PageHero } from '@/components/PageHero';
import { GUIDES, groupGuides, type GuideSummary } from '@/lib/guides';
import { SITE_URL } from '@/lib/site-config';
import { buildItemListSchema, buildBreadcrumbSchema } from '@/lib/structured-data';
import { CARD_TITLE, CONTENT_TITLE, PAGE_WIDTHS, PANEL, TEXT_LINK } from '@/lib/storefront-styles';

const TITLE = 'Airsoft Guides — Beginner Advice & Buying Help | Strike Arms';
const DESCRIPTION =
  'Straightforward airsoft guides from a Dublin airsoft shop: choosing a gun, FPS and joules, BB weight, batteries, gas and maintenance. Written for players in Ireland.';

export default function GuidesHub() {
  const groups = groupGuides();
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
  ];

  return (
    <SiteLayout>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/guides`} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/guides`} />
      </Helmet>
      <JsonLd
        data={[
          buildItemListSchema(GUIDES.map((g) => ({ name: g.title, path: g.path }))),
          buildBreadcrumbSchema(crumbs),
        ]}
      />

      <PageHero
        crumbs={[{ label: 'Guides' }]}
        eyebrow="Advice from the counter"
        title="Airsoft Guides"
        intro={
          <p>
            Clear, no-nonsense advice from the team at Strike Arms, a walk-in airsoft shop in Swords,
            Co. Dublin. New to airsoft or upgrading your kit? Start here, then browse the shop with
            confidence.
          </p>
        }
        width="medium"
      />

      <div className={`mx-auto px-4 md:px-6 py-12 md:py-16 ${PAGE_WIDTHS.medium}`}>
        <div className="space-y-14">
          {groups.map((group) => (
            <section key={group.group}>
              <h2 className={CONTENT_TITLE}>{group.group}</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {group.guides.map((guide) => (
                  <GuideCard key={guide.path} guide={guide} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className={`${PANEL} mt-14 p-6`}>
          <p className={`${CARD_TITLE} text-lg`}>Looking for a term you do not recognise?</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Our <Link href="/glossary" className={TEXT_LINK}>airsoft
            glossary</Link> explains the jargon, from AEG and hop-up to joules and MOSFETs.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}

function GuideCard({ guide }: { guide: GuideSummary }) {
  return (
    <Link
      href={guide.path}
      className={`group flex flex-col p-6 transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${PANEL}`}
    >
      <BookOpen className="h-5 w-5 text-accent" />
      <h3 className={`${CARD_TITLE} mt-4 text-lg`}>{guide.navLabel}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{guide.summary}</p>
      <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-xs font-black uppercase tracking-wider text-accent">
        Read guide
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
