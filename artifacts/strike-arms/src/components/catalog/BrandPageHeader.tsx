import { Link } from 'wouter';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
    <>
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
              <Link href="/brands">Brands</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="mt-6 text-3xl font-bold text-foreground md:text-4xl">{name}</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{intro}</p>

      {links.length > 0 && (
        <nav aria-label={`${name} by category`} className="mt-6 flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className="rounded-sm border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
              <span className="ml-1.5 text-muted-foreground">{link.count}</span>
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
