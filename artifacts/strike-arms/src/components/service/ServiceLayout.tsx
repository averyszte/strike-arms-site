import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';

import { JsonLd } from '@/components/JsonLd';
import { SiteLayout } from '@/components/SiteLayout';
import { ServiceFaqList } from '@/components/service/ServiceFaqList';
import { ServiceHero } from '@/components/service/ServiceHero';
import { ServiceQuoteBlock } from '@/components/service/ServiceQuoteBlock';
import { ServiceTocNav, type ServiceTocItem } from '@/components/service/ServiceTocNav';
import type { ServiceFact } from '@/components/service/ServiceTiles';
import { SITE_URL } from '@/lib/site-config';
import { CONTENT_TITLE, PAGE_WIDTHS } from '@/lib/storefront-styles';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildServiceSchema,
  type FaqItem,
  type JsonLdObject,
} from '@/lib/structured-data';

/**
 * Body copy styling.
 *
 * Block rules are direct-child only (`[&>p]`, not `[&_p]`) so they style the
 * page's own prose and stop at the edge of a content component — otherwise a
 * `[&_ol]:list-decimal` reaches inside ServiceSteps and undoes it, and the
 * child selector wins on specificity. Inline rules (links, strong) stay
 * descendant, because those should apply wherever they appear.
 */
const PROSE =
  'text-foreground ' +
  '[&>h3]:mt-8 [&>h3]:text-lg [&>h3]:font-black [&>h3]:uppercase [&>h3]:tracking-wide [&>h3]:text-foreground ' +
  '[&>p]:mt-4 [&>p]:leading-relaxed [&>p]:text-muted-foreground ' +
  '[&>ul]:mt-4 [&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-5 [&>ul]:text-muted-foreground ' +
  '[&>ol]:mt-4 [&>ol]:list-decimal [&>ol]:space-y-2 [&>ol]:pl-5 [&>ol]:text-muted-foreground ' +
  '[&>ul>li::marker]:text-accent [&>ol>li::marker]:text-accent ' +
  '[&_a]:font-bold [&_a]:text-accent hover:[&_a]:underline ' +
  '[&_strong]:font-semibold [&_strong]:text-foreground ' +
  '[&_table]:mt-4 [&_table]:w-full [&_table]:text-sm [&_th]:py-2 [&_th]:pr-4 [&_th]:text-left [&_th]:text-xs [&_th]:font-black [&_th]:uppercase [&_th]:tracking-wider ' +
  '[&_td]:border-t [&_td]:border-border/60 [&_td]:py-2 [&_td]:pr-4 [&_td]:text-muted-foreground';

/** One h2-level block of a service page. */
export interface ServiceSection {
  /** Anchor target, also the ToC key. Kebab-case, unique to the page. */
  id: string;
  title: string;
  body: ReactNode;
}

export interface ServiceLayoutProps {
  title: string;
  metaTitle?: string;
  description: string;
  path: string;
  serviceType: string;
  intro: string;
  /** Small-caps line above the h1. */
  eyebrow?: string;
  /** Up to three scannable answers, shown under the hero. */
  facts?: ServiceFact[];
  sections: ServiceSection[];
  faq?: FaqItem[];
}

const FAQ_HEADING = 'Frequently asked questions';

export function ServiceLayout(props: ServiceLayoutProps) {
  const { title, metaTitle, description, path, serviceType, intro } = props;
  const { eyebrow = 'Workshop service', facts = [], sections, faq } = props;

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: title, path },
  ];
  const schema: JsonLdObject[] = [
    buildServiceSchema({ name: title, description, path, serviceType }),
    buildBreadcrumbSchema(crumbs),
  ];
  if (faq && faq.length > 0) schema.push(buildFaqSchema(faq));

  const toc: ServiceTocItem[] = sections.map(({ id, title: sectionTitle }) => ({
    id,
    title: sectionTitle,
  }));
  if (faq && faq.length > 0) toc.push({ id: 'faq', title: FAQ_HEADING });

  return (
    <SiteLayout>
      <Helmet>
        <title>{metaTitle ?? `${title} | Strike Arms Airsoft Dublin`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE_URL}${path}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}${path}`} />
      </Helmet>
      <JsonLd data={schema} />

      <ServiceHero title={title} eyebrow={eyebrow} intro={intro} facts={facts} />

      <div className={`mx-auto px-4 py-12 md:px-6 md:py-16 ${PAGE_WIDTHS.medium}`}>
        <div className="lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-14">
          <aside className="hidden lg:block">
            {toc.length > 1 && <ServiceTocNav items={toc} />}
          </aside>

          <div className="min-w-0">
            {sections.map((section) => (
              <ServiceSectionBlock key={section.id} section={section} />
            ))}

            {faq && faq.length > 0 && (
              <section id="faq" className="mt-14 scroll-mt-28">
                <SectionHeading>{FAQ_HEADING}</SectionHeading>
                <ServiceFaqList items={faq} />
              </section>
            )}

            <div id="quote" className="scroll-mt-28">
              <ServiceQuoteBlock serviceTitle={title} />
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function ServiceSectionBlock({ section }: { section: ServiceSection }) {
  return (
    <section id={section.id} className="scroll-mt-28 [&+section]:mt-14">
      <SectionHeading>{section.title}</SectionHeading>
      <div className={PROSE}>{section.body}</div>
    </section>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <>
      <span aria-hidden="true" className="block h-0.5 w-8 bg-accent" />
      <h2 className={`${CONTENT_TITLE} mt-4`}>
        {children}
      </h2>
    </>
  );
}
