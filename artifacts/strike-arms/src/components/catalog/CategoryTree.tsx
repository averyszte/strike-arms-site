import { Link } from 'wouter';

import { cn } from '@/lib/class-names';
import { TAXONOMY } from '@/lib/taxonomy';
import type { CategorySlug } from '@/lib/taxonomy';
import { isShelfVisible } from '@/lib/shelf-visibility';

/**
 * The shop's shelves, as links rather than filters.
 *
 * Category and subcategory live in the URL path, so choosing one is navigation
 * and gets an anchor; everything else in the sidebar is a filter on the current
 * shelf and gets a control.
 *
 * Shelves with nothing published are left out, so nobody clicks through to an
 * empty page; the one being viewed always stays. Until counts arrive every
 * shelf shows, rather than the tree popping in from nothing.
 */

export interface CategoryTreeProps {
  activeCategorySlug?: CategorySlug;
  activeSubcategorySlug?: string;
  onNavigate?: () => void;
  /** Published products per shelf, keyed `rifles` and `rifles/aeg-rifles`. */
  shelfCounts?: Record<string, number>;
}

function ShelfCount({ count }: { count?: number }) {
  if (count === undefined) return null;
  return (
    <span className="ml-auto pl-2 text-xs font-normal tabular-nums text-muted-foreground">
      {count}
    </span>
  );
}

export function CategoryTree({
  activeCategorySlug,
  activeSubcategorySlug,
  onNavigate,
  shelfCounts,
}: CategoryTreeProps) {
  const categories = TAXONOMY.filter((cat) =>
    isShelfVisible(shelfCounts, cat.slug, activeCategorySlug === cat.slug),
  );

  return (
    <div className="space-y-0.5">
      <Link
        href="/store"
        onClick={onNavigate}
        className={cn(
          'block border-l-2 border-transparent px-2 py-1.5 text-sm transition-colors',
          !activeCategorySlug
            ? 'border-l-2 border-accent text-foreground font-bold'
            : 'text-muted-foreground hover:text-accent',
        )}
      >
        All Products
      </Link>

      {categories.map((cat) => {
        const isActiveCat = activeCategorySlug === cat.slug;
        const subcategories = cat.subcategories.filter((sub) =>
          isShelfVisible(
            shelfCounts,
            `${cat.slug}/${sub.slug}`,
            isActiveCat && activeSubcategorySlug === sub.slug,
          ),
        );
        return (
          <div key={cat.slug}>
            <Link
              href={`/store/${cat.slug}`}
              onClick={onNavigate}
              className={cn(
                'flex items-center border-l-2 border-transparent px-2 py-1.5 text-sm transition-colors',
                isActiveCat
                  ? 'border-l-2 border-accent text-foreground font-bold'
                  : 'text-muted-foreground hover:text-accent',
              )}
            >
              {cat.shortLabel}
              <ShelfCount count={shelfCounts?.[cat.slug]} />
            </Link>

            {isActiveCat && (
              <div className="ml-4 mt-0.5 mb-1 space-y-0.5">
                {subcategories.map((sub) => {
                  const isActiveSub = activeSubcategorySlug === sub.slug;
                  return (
                    <Link
                      key={sub.slug}
                      href={`/store/${cat.slug}/${sub.slug}`}
                      onClick={onNavigate}
                      className={cn(
                        'flex items-center px-2 py-1 text-sm transition-colors',
                        isActiveSub
                          ? 'text-accent font-bold'
                          : 'text-muted-foreground hover:text-accent',
                      )}
                    >
                      {sub.label}
                      <ShelfCount count={shelfCounts?.[`${cat.slug}/${sub.slug}`]} />
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
