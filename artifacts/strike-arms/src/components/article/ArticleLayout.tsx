import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';

import { SiteLayout } from '@/components/SiteLayout';
import { JsonLd } from '@/components/JsonLd';
import { Button } from '@/components/ui/button';
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
  type JsonLdObject,
} from '@/lib/structured-data';

// Tailwind child selectors so guide bodies stay plain semantic HTML.
const PROSE =
  'mt-8 text-foreground [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold ' +
  '[&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-muted-foreground ' +
  '[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:text-muted-foreground ' +
  '[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:text-muted-foreground ' +
  '[&_a]:font-medium [&_a]:text-accent hover:[&_a]:underline ' +
  '[&_table]:mt-4 [&_table]:w-full [&_table]:text-sm [&_th]:text-left [&_th]:font-semibold [&_th]:py-2 [&_th]:pr-4 ' +
  '[&_td]:py-2 [&_td]:pr-4 [&_td]:border-t [&_td]:border-border [&_td]:text-muted-foreground';

export interface ArticleLayoutProps {
  title: string;
  metaTitle?: string;
  description: string;
  path: string;
  updatedISO: string;
  updatedLabel: string;
  intro: string;
  faq?: FaqItem[];
  cta?: { label: string; href: string };
  children: ReactNode;
}

export function ArticleLayout(props: ArticleLayoutProps) {
  const { title, metaTitle, description, path, updatedISO, updatedLabel, intro, faq, cta } = props;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides' },
    { name: title, path },
  ];
  const schema: JsonLdObject[] = [
    buildArticleSchema({ title, description, path, isoDate: updatedISO }),
    buildBreadcrumbSchema(crumbs),
  ];
  if (faq && faq.length > 0) schema.push(buildFaqSchema(faq));

  return (
    <SiteLayout>
      <Helmet>
        <title>{metaTitle ?? `${title} | Strike Arms Airsoft Dublin`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE_URL}${path}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${SITE_URL}${path}`} />
      </Helmet>
      <JsonLd data={schema} />

      <article className="max-w-[760px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/guides">Guides</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="mt-6 text-3xl md:text-4xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last reviewed: {updatedLabel}</p>
        <p className="mt-5 text-lg text-foreground leading-relaxed">{intro}</p>

        <div className={PROSE}>{props.children}</div>

        {faq && faq.length > 0 && <FaqSection items={faq} />}
        <CtaBlock cta={cta} />
      </article>
    </SiteLayout>
  );
}

function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-foreground">Frequently asked questions</h2>
      <dl className="mt-4 space-y-6">
        {items.map((item) => (
          <div key={item.question}>
            <dt className="font-semibold text-foreground">{item.question}</dt>
            <dd className="mt-1 text-muted-foreground leading-relaxed">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function CtaBlock({ cta }: { cta?: { label: string; href: string } }) {
  const target = cta ?? { label: 'Browse the shop', href: '/store' };
  return (
    <div className="mt-12 rounded-sm border border-border bg-card p-6">
      <p className="font-semibold text-foreground">Not sure what is right for you?</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Strike Arms is a walk-in airsoft shop in Swords, Co. Dublin with in-house advice, repairs and
        upgrades. We ship across Ireland.
      </p>
      <Button asChild className="mt-4">
        <Link href={target.href}>
          {target.label}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
