import { Fragment, type ReactNode } from 'react';
import { Link } from 'wouter';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DISPLAY_TITLE,
  DISPLAY_TITLE_COMPACT,
  EYEBROW,
  GRID_TEXTURE,
  PAGE_WIDTHS,
  type PageWidth,
} from '@/lib/storefront-styles';

export interface Crumb {
  label: string;
  /** Omitted on the current page, which renders as plain text. */
  href?: string;
}

interface PageHeroProps {
  /** Home is added automatically; list the rest, ending with the current page. */
  crumbs?: Crumb[];
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Small line under the intro, e.g. "Last reviewed: ...". */
  meta?: ReactNode;
  width?: PageWidth;
  /** Compact type for utility pages (cart, account, sign-in). */
  isCompact?: boolean;
  /** CTAs, fact tiles or controls under the intro. */
  children?: ReactNode;
}

/**
 * The page header every storefront page opens with: the homepage's final-CTA
 * treatment (card surface, grid paper, accent glow) with black uppercase
 * display type and a tracked accent eyebrow.
 */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  intro,
  meta,
  width = 'medium',
  isCompact = false,
  children,
}: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-card">
      <div className={`pointer-events-none absolute inset-0 ${GRID_TEXTURE}`} />
      <div className="pointer-events-none absolute -right-32 -top-40 h-[420px] w-[620px] rounded-full bg-accent/10 blur-[120px]" />

      <div
        className={`relative mx-auto px-4 md:px-6 ${PAGE_WIDTHS[width]} ${
          isCompact ? 'py-8 md:py-12' : 'py-10 md:py-16'
        }`}
      >
        {crumbs && crumbs.length > 0 && <HeroCrumbs crumbs={crumbs} />}
        {eyebrow && <p className={`${EYEBROW} ${crumbs ? 'mt-8' : ''}`}>{eyebrow}</p>}
        <h1
          className={`${isCompact ? DISPLAY_TITLE_COMPACT : DISPLAY_TITLE} max-w-4xl ${
            eyebrow ? 'mt-3' : crumbs ? 'mt-8' : ''
          }`}
        >
          {title}
        </h1>
        {intro && (
          <div className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {intro}
          </div>
        )}
        {meta && <p className="mt-3 text-sm text-muted-foreground">{meta}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

function HeroCrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs font-bold uppercase tracking-wider">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {crumbs.map((crumb) => (
          <Fragment key={crumb.label}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {crumb.href ? (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="line-clamp-1">{crumb.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
