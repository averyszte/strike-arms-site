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
import {
  parseFiltersFromSearch,
  filtersToSearchParams,
  hasActiveFilters,
} from '@/lib/category-filters';
import {
  isValidCategorySlug,
  getCategory,
  getSubcategory,
} from '@/lib/taxonomy';
import type { CategorySlug } from '@/lib/taxonomy';
import type { Category, ProductFilters } from '@/types/product';
import NotFound from '@/pages/not-found';

export default function ShopPage() {
  const { category: rawCategory, subcategory: rawSubcategory } = useParams<{
    category?: string;
    subcategory?: string;
  }>();
  const search = useSearch();
  const [, setLocation] = useLocation();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ── Validation ───────────────────────────────────────────────────────────────
  if (rawCategory && !isValidCategorySlug(rawCategory)) {
    return <NotFound />;
  }
  if (rawCategory && rawSubcategory && !getSubcategory(rawCategory, rawSubcategory)) {
    return <NotFound />;
  }

  const categorySlug = rawCategory as CategorySlug | undefined;
  const categoryDef = categorySlug ? getCategory(categorySlug) : undefined;
  const subcategoryDef = categorySlug && rawSubcategory
    ? getSubcategory(categorySlug, rawSubcategory)
    : undefined;

  // ── Derived labels ───────────────────────────────────────────────────────────
  const h1 = subcategoryDef?.label ?? categoryDef?.label ?? 'Shop';

  // Canonical and title follow the SEO promotion logic:
  // if subcategory.seo exists → canonical = self, use subcategory metadata
  // otherwise → canonical = parent (category or /store)
  const subSeoPromo = subcategoryDef?.seo;
  let canonicalPath: string;
  let helmetTitle: string;
  let helmetDescription: string;

  if (categorySlug && rawSubcategory) {
    if (subSeoPromo) {
      canonicalPath = `/store/${categorySlug}/${rawSubcategory}`;
      helmetTitle = subSeoPromo.title ?? `${subcategoryDef!.label} | Strike Arms Airsoft Dublin`;
      helmetDescription = subSeoPromo.description;
    } else {
      canonicalPath = `/store/${categorySlug}`;
      helmetTitle = categoryDef
        ? `${categoryDef.label} | Strike Arms Airsoft Dublin`
        : 'Shop | Strike Arms Airsoft Dublin';
      helmetDescription = `Shop ${(categoryDef?.label ?? 'all products').toLowerCase()} at Strike Arms Airsoft Dublin.`;
    }
  } else if (categorySlug) {
    canonicalPath = `/store/${categorySlug}`;
    helmetTitle = `${categoryDef!.label} | Strike Arms Airsoft Dublin`;
    helmetDescription = `Shop ${categoryDef!.label.toLowerCase()} at Strike Arms Airsoft Dublin.`;
  } else {
    canonicalPath = '/store';
    helmetTitle = 'Shop | Strike Arms Airsoft Dublin';
    helmetDescription = 'Browse the full range of airsoft guns, gear, and accessories at Strike Arms Dublin.';
  }

  // ── Filters ──────────────────────────────────────────────────────────────────
  const filters = parseFiltersFromSearch(
    search,
    categorySlug as Category | undefined,
    rawSubcategory,
  );

  return (
    <ShopPageInner
      categorySlug={categorySlug}
      rawSubcategory={rawSubcategory}
      h1={h1}
      canonicalPath={canonicalPath}
      helmetTitle={helmetTitle}
      helmetDescription={helmetDescription}
      subSeoIntro={subSeoPromo?.intro}
      filters={filters}
      mobileFiltersOpen={mobileFiltersOpen}
      setMobileFiltersOpen={setMobileFiltersOpen}
      setLocation={setLocation}
    />
  );
}

// ── Inner component (hooks run after guards) ──────────────────────────────────
interface InnerProps {
  categorySlug: CategorySlug | undefined;
  rawSubcategory: string | undefined;
  h1: string;
  canonicalPath: string;
  helmetTitle: string;
  helmetDescription: string;
  subSeoIntro: string | undefined;
  filters: ProductFilters;
  mobileFiltersOpen: boolean;
  setMobileFiltersOpen: (v: boolean) => void;
  setLocation: (href: string, opts?: { replace?: boolean }) => void;
}

function ShopPageInner({
  categorySlug,
  rawSubcategory,
  h1,
  canonicalPath,
  helmetTitle,
  helmetDescription,
  subSeoIntro,
  filters,
  mobileFiltersOpen,
  setMobileFiltersOpen,
  setLocation,
}: InnerProps) {
  const { data, isLoading } = useProducts(filters);

  const buildBasePath = useCallback(() => {
    if (rawSubcategory && categorySlug) return `/store/${categorySlug}/${rawSubcategory}`;
    if (categorySlug) return `/store/${categorySlug}`;
    return '/store';
  }, [categorySlug, rawSubcategory]);

  const pushFilters = useCallback(
    (newFilters: ProductFilters) => {
      const params = filtersToSearchParams(newFilters);
      const qs = params.toString();
      setLocation(`${buildBasePath()}${qs ? `?${qs}` : ''}`, { replace: true });
    },
    [buildBasePath, setLocation],
  );

  const handleFilterChange = useCallback(
    (patch: Partial<ProductFilters>) => {
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
    setLocation(buildBasePath(), { replace: true });
  }, [buildBasePath, setLocation]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <SiteLayout>
      <Helmet>
        <title>{helmetTitle}</title>
        <meta name="description" content={helmetDescription} />
        <link rel="canonical" href={`https://strikearms.ie${canonicalPath}`} />
      </Helmet>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8">
        {subSeoIntro && (
          <p className="text-muted-foreground mb-6 max-w-2xl">{subSeoIntro}</p>
        )}

        <ResultsHeader
          activeCategorySlug={categorySlug}
          activeSubcategorySlug={rawSubcategory}
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
                activeCategorySlug={categorySlug}
                activeSubcategorySlug={rawSubcategory}
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
            activeCategorySlug={categorySlug}
            activeSubcategorySlug={rawSubcategory}
            filters={filters}
            onFilterChange={(patch) => {
              handleFilterChange(patch);
              if (!hasActiveFilters({ ...filters, ...patch })) {
                setMobileFiltersOpen(false);
              }
            }}
            onNavigate={() => setMobileFiltersOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </SiteLayout>
  );
}
