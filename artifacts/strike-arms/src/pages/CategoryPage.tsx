import { useState, useCallback } from 'react';
import { useParams, useSearch, useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { SiteLayout } from '@/components/SiteLayout';
import { ResultsHeader } from '@/components/catalog/ResultsHeader';
import { FilterSidebarContent } from '@/components/catalog/FilterSidebar';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { Pagination } from '@/components/catalog/Pagination';
import { useProducts } from '@/hooks/useProducts';
import { parseFiltersFromSearch, filtersToSearchParams, hasActiveFilters } from '@/lib/category-filters';
import type { Category, ProductFilters } from '@/types/product';
import NotFound from '@/pages/not-found';

const SLUG_MAP: Record<string, string> = {
  rifles: 'Airsoft Rifles',
  pistols: 'Airsoft Pistols',
  consumables: 'Consumables',
  accessories: 'Accessories',
  gear: 'Tactical Gear',
  'upgrades-repairs': 'Upgrades & Repairs',
};

const PRODUCT_CATEGORIES: Category[] = ['rifles', 'pistols', 'consumables', 'accessories', 'gear'];

function isProductCategory(slug: string): slug is Category {
  return PRODUCT_CATEGORIES.includes(slug as Category);
}

export default function CategoryPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const search = useSearch();
  const [, setLocation] = useLocation();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const displayName = SLUG_MAP[slug];

  if (!displayName) {
    return <NotFound />;
  }

  // upgrades-repairs is a valid slug for navigation but has no product catalogue yet
  if (!isProductCategory(slug)) {
    return (
      <SiteLayout>
        <Helmet>
          <title>{displayName} — Strike Arms Airsoft Dublin</title>
          <link rel="canonical" href={`https://strikearms.ie/categories/${slug}`} />
        </Helmet>
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold text-foreground mb-4">{displayName}</h1>
          <p className="text-muted-foreground">Coming soon.</p>
        </div>
      </SiteLayout>
    );
  }

  const filters = parseFiltersFromSearch(search, slug);

  return (
    <CategoryPageInner
      slug={slug}
      displayName={displayName}
      filters={filters}
      mobileFiltersOpen={mobileFiltersOpen}
      setMobileFiltersOpen={setMobileFiltersOpen}
      setLocation={setLocation}
    />
  );
}

// Inner component so hooks run after the early-return guards above
interface InnerProps {
  slug: Category;
  displayName: string;
  filters: ProductFilters;
  mobileFiltersOpen: boolean;
  setMobileFiltersOpen: (v: boolean) => void;
  setLocation: (href: string, opts?: { replace?: boolean }) => void;
}

function CategoryPageInner({
  slug,
  displayName,
  filters,
  mobileFiltersOpen,
  setMobileFiltersOpen,
  setLocation,
}: InnerProps) {
  const { data, isLoading } = useProducts(filters);

  const pushFilters = useCallback(
    (newFilters: ProductFilters) => {
      const params = filtersToSearchParams(newFilters);
      const qs = params.toString();
      setLocation(`/categories/${slug}${qs ? `?${qs}` : ''}`, { replace: true });
    },
    [slug, setLocation],
  );

  const handleFilterChange = useCallback(
    (patch: Partial<ProductFilters>) => {
      // Reset page to 1 on any filter change unless patch explicitly sets page
      const next: ProductFilters = { ...filters, ...patch };
      if (!('page' in patch)) next.page = 1;
      pushFilters(next);
    },
    [filters, pushFilters],
  );

  const handleSortChange = useCallback(
    (sort: ProductFilters['sort']) => {
      pushFilters({ ...filters, sort, page: 1 });
    },
    [filters, pushFilters],
  );

  const handleLoadMore = useCallback(() => {
    pushFilters({ ...filters, page: (filters.page ?? 1) + 1 });
  }, [filters, pushFilters]);

  const handleClearFilters = useCallback(() => {
    setLocation(`/categories/${slug}`, { replace: true });
  }, [slug, setLocation]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <SiteLayout>
      <Helmet>
        <title>{displayName} | Strike Arms Airsoft Dublin</title>
        <meta
          name="description"
          content={`Shop ${displayName.toLowerCase()} at Strike Arms Airsoft Dublin.`}
        />
        {/* Canonical never includes query params */}
        <link rel="canonical" href={`https://strikearms.ie/categories/${slug}`} />
      </Helmet>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
        <ResultsHeader
          categoryName={displayName}
          total={total}
          isLoading={isLoading}
          filters={filters}
          onSortChange={handleSortChange}
          onOpenMobileFilters={() => setMobileFiltersOpen(true)}
        />

        <div className="mt-6 flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-[240px] shrink-0">
            <div className="sticky top-[var(--header-height,120px)]">
              <FilterSidebarContent
                category={slug}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <ProductGrid
              products={items}
              isLoading={isLoading}
              onClearFilters={handleClearFilters}
            />
            {!isLoading && total > 0 && (
              <Pagination
                showing={items.length}
                total={total}
                onLoadMore={handleLoadMore}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter Sheet */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="w-[300px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <FilterSidebarContent
            category={slug}
            filters={filters}
            onFilterChange={(patch) => {
              handleFilterChange(patch);
              if (
                !hasActiveFilters({ ...filters, ...patch }) ||
                'subcategory' in patch ||
                'brand' in patch
              ) {
                setMobileFiltersOpen(false);
              }
            }}
          />
        </SheetContent>
      </Sheet>
    </SiteLayout>
  );
}
