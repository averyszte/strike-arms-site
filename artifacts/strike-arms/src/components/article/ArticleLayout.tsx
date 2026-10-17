import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';

import { SiteLayout } from '@/components/SiteLayout';
import { JsonLd } from '@/components/JsonLd';
import { PageHero } from '@/components/PageHero';
import { CtaBand } from '@/components/CtaBand';
import { SITE_URL } from '@/lib/site-config';
import {
  buildArticleSchema,
  buildFaqSchema,
  buildBreadcrumbSchema,
  type FaqItem,
  type JsonLdObject,
} from '@/lib/structured-data';
import { ARTICLE_PROSE, CARD_TITLE, CONTENT_TITLE } from '@/lib/storefront-styles';

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

      <PageHero
        crumbs={[{ label: 'Guides', href: '/guides' }, { label: title }]}
        eyebrow="Strike Arms guide"
        title={title}
        intro={intro}
        meta={`Last reviewed: ${updatedLabel}`}
        width="narrow"
      />

      <article className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <div className={`${ARTICLE_PROSE} [&>h2:first-child]:mt-0`}>{props.children}</div>
        {faq && faq.length > 0 && <FaqSection items={faq} />}
      </article>

      <CtaBand
        eyebrow="Not sure what is right for you?"
        title="Ask the people who play."
        text="Strike Arms is a walk-in airsoft shop in Swords, Co. Dublin with in-house advice, repairs and upgrades. We ship across Ireland."
        cta={cta ?? { label: 'Browse the shop', href: '/store' }}
      />
    </SiteLayout>
  );
}

function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <section className="mt-16 border-t border-border/60 pt-12">
      <h2 className={CONTENT_TITLE}>Frequently asked questions</h2>
      <dl className="mt-6 divide-y divide-border/60 border-y border-border/60">
        {items.map((item) => (
          <div key={item.question} className="py-5">
            <dt className={`${CARD_TITLE} text-base`}>{item.question}</dt>
            <dd className="mt-2 leading-relaxed text-muted-foreground">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
