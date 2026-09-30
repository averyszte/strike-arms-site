import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';

import { PageHero, type Crumb } from '@/components/PageHero';
import { SiteLayout } from '@/components/SiteLayout';
import { SITE_URL } from '@/lib/site-config';
import { PAGE_WIDTHS } from '@/lib/storefront-styles';

type AccountPageFrameProps = {
  /** The <title>, before " | Strike Arms Airsoft Dublin". */
  pageTitle: string;
  path: string;
  crumbs: Crumb[];
  title: string;
  intro?: string;
  children: ReactNode;
};

/** The shared shell of the /account pages. None of them are for search engines. */
export function AccountPageFrame({ pageTitle, path, crumbs, title, intro, children }: AccountPageFrameProps) {
  return (
    <SiteLayout>
      <Helmet>
        <title>{`${pageTitle} | Strike Arms Airsoft Dublin`}</title>
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href={`${SITE_URL}${path}`} />
      </Helmet>
      <PageHero
        crumbs={crumbs}
        eyebrow="Your account"
        title={title}
        intro={intro}
        width="narrow"
        isCompact
      />
      <div className={`mx-auto px-4 md:px-6 py-12 md:py-16 ${PAGE_WIDTHS.narrow}`}>
        <div className="space-y-6">{children}</div>
      </div>
    </SiteLayout>
  );
}
