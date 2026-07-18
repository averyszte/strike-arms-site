import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { ArrowRight, BookOpen } from 'lucide-react';

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
import { GUIDES, groupGuides, type GuideSummary } from '@/lib/guides';
import { SITE_URL } from '@/lib/site-config';
import { buildItemListSchema, buildBreadcrumbSchema } from '@/lib/structured-data';

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
              <BreadcrumbPage>Guides</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="mt-6 text-3xl md:text-4xl font-bold text-foreground">Airsoft Guides</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">
          Clear, no-nonsense advice from the team at Strike Arms, a walk-in airsoft shop in Swords,
          Co. Dublin. New to airsoft or upgrading your kit? Start here, then browse the shop with
          confidence.
        </p>

        <div className="mt-10 space-y-10">
          {groups.map((group) => (
            <section key={group.group}>
              <h2 className="text-xl font-bold text-foreground">{group.group}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {group.guides.map((guide) => (
                  <GuideCard key={guide.path} guide={guide} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-sm border border-border bg-card p-6">
          <p className="font-semibold text-foreground">Looking for a term you do not recognise?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Our <Link href="/glossary" className="font-medium text-accent hover:underline">airsoft
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
      className="group flex flex-col rounded-sm border border-border bg-card p-5 transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <BookOpen className="h-5 w-5 text-accent" />
      <h3 className="mt-3 font-semibold text-foreground leading-snug">{guide.navLabel}</h3>
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{guide.summary}</p>
      <span className="mt-3 inline-flex items-center text-sm font-medium text-accent">
        Read guide
        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
