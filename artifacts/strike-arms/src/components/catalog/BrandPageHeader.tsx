import { Link } from 'wouter';

import { PageHero } from '@/components/PageHero';
import type { BrandCategoryLink } from '@/lib/brand-page-meta';

/** Breadcrumb, heading, intro and the shelf links for a brand page. */
export function BrandPageHeader({
  name,
  intro,
  links,
}: {
  name: string;
  intro: string;
  links: BrandCategoryLink[];
}) {
  return (
    <PageHero
      width="wide"
      crumbs={[{ label: 'Brands', href: '/brands' }, { label: name }]}
      eyebrow="Brand"
      title={name}
      intro={intro}
    >
      {links.length > 0 && (
        <nav aria-label={`${name} by category`} className="flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className="border-2 border-border px-4 py-2 text-xs font-black uppercase tracking-wider text-foreground transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
              <span className="ml-2 text-muted-foreground">{link.count}</span>
            </Link>
          ))}
        </nav>
      )}
    </PageHero>
  );
}
