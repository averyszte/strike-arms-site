import { Link } from 'wouter';

import { cn } from '@/lib/utils';
import { TAXONOMY } from '@/lib/taxonomy';
import type { CategorySlug } from '@/lib/taxonomy';

/**
 * The shop's shelves, as links rather than filters.
 *
 * Category and subcategory live in the URL path, so choosing one is navigation
 * and gets an anchor; everything else in the sidebar is a filter on the current
 * shelf and gets a control.
 */

export interface CategoryTreeProps {
  activeCategorySlug?: CategorySlug;
  activeSubcategorySlug?: string;
  onNavigate?: () => void;
}

export function CategoryTree({
  activeCategorySlug,
  activeSubcategorySlug,
  onNavigate,
}: CategoryTreeProps) {
  return (
    <div className="space-y-0.5">
      <Link
        href="/store"
        onClick={onNavigate}
        className={cn(
          'block px-2 py-1.5 text-sm rounded-sm transition-colors',
          !activeCategorySlug
            ? 'text-foreground font-semibold'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        All Products
      </Link>

      {TAXONOMY.map((cat) => {
        const isActiveCat = activeCategorySlug === cat.slug;
        return (
          <div key={cat.slug}>
            <Link
              href={`/store/${cat.slug}`}
              onClick={onNavigate}
              className={cn(
                'block px-2 py-1.5 text-sm rounded-sm transition-colors',
                isActiveCat
                  ? 'text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {cat.shortLabel}
            </Link>

            {isActiveCat && (
              <div className="ml-4 mt-0.5 mb-1 space-y-0.5">
                {cat.subcategories.map((sub) => {
                  const isActiveSub = activeSubcategorySlug === sub.slug;
                  return (
                    <Link
                      key={sub.slug}
                      href={`/store/${cat.slug}/${sub.slug}`}
                      onClick={onNavigate}
                      className={cn(
                        'block px-2 py-1 text-sm rounded-sm transition-colors',
                        isActiveSub
                          ? 'text-accent font-medium'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
