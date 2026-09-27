import { ArrowRight, Phone } from 'lucide-react';

import { PageHero } from '@/components/PageHero';
import { ServiceTiles, type ServiceFact } from '@/components/service/ServiceTiles';
import { BUSINESS } from '@/lib/site-config';
import { CTA_ARROW, CTA_PRIMARY, CTA_SECONDARY, phoneHref } from '@/lib/storefront-styles';

export interface ServiceHeroProps {
  title: string;
  eyebrow: string;
  intro: string;
  facts: ServiceFact[];
}

/**
 * The top of a service page.
 *
 * Every service page used to open with a breadcrumb, an h1 and a paragraph on
 * the page background, which gave a visitor nothing to act on until they had
 * read the whole article. The band puts the two things they came for — the
 * quote form and the phone number — above the fold, and the fact tiles answer
 * the scannable questions so the prose can take its time.
 */
export function ServiceHero({ title, eyebrow, intro, facts }: ServiceHeroProps) {
  return (
    <PageHero
      crumbs={[{ label: 'Services', href: '/services' }, { label: title }]}
      eyebrow={eyebrow}
      title={title}
      intro={intro}
      width="medium"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a href="#quote" className={CTA_PRIMARY}>
          Request a quote
          <ArrowRight className={CTA_ARROW} aria-hidden="true" />
        </a>
        <a href={phoneHref(BUSINESS.telephone)} className={CTA_SECONDARY}>
          <Phone className="h-5 w-5" aria-hidden="true" />
          {BUSINESS.telephone}
        </a>
      </div>

      <ServiceTiles items={facts} />
    </PageHero>
  );
}
