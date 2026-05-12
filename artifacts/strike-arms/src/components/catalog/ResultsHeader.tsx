import { Link } from 'wouter';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SortDropdown } from './SortDropdown';
import { getCategory, getSubcategory } from '@/lib/taxonomy';
import type { CategorySlug } from '@/lib/taxonomy';
import type { ProductFilters } from '@/types/product';

interface ResultsHeaderProps {
  activeCategorySlug?: CategorySlug;
  activeSubcategorySlug?: string;
  total: number;
  isLoading: boolean;
  filters: ProductFilters;
  onSortChange: (sort: ProductFilters['sort']) => void;
  onOpenMobileFilters: () => void;
}

export function ResultsHeader({
  activeCategorySlug,
  activeSubcategorySlug,
  total,
  isLoading,
  filters,
  onSortChange,
  onOpenMobileFilters,
}: ResultsHeaderProps) {
  const categoryDef = activeCategorySlug ? getCategory(activeCategorySlug) : undefined;
  const subcategoryDef =
    activeCategorySlug && activeSubcategorySlug
      ? getSubcategory(activeCategorySlug, activeSubcategorySlug)
      : undefined;

  // Deepest label for h1
  const h1 = subcategoryDef?.label ?? categoryDef?.label ?? 'Shop';

  // Build breadcrumb segments
  // /store → Home › Shop (Shop is the page)
  // /store/cat → Home › Shop › Category
  // /store/cat/sub → Home › Shop › Category › Subcategory
  const breadcrumbSegments: { label: string; href?: string }[] = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: activeCategorySlug ? '/store' : undefined },
  ];

  if (categoryDef) {
    breadcrumbSegments.push({
      label: categoryDef.label,
      href: subcategoryDef ? `/store/${activeCategorySlug}` : undefined,
    });
  }

  if (subcategoryDef) {
    breadcrumbSegments.push({ label: subcategoryDef.label });
  }

  return (
    <div className="space-y-3 pb-5 border-b border-border">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbSegments.map((seg, i) => (
            <span key={seg.label} className="contents">
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {seg.href ? (
                  <BreadcrumbLink asChild>
                    <Link href={seg.href}>{seg.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{seg.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-tight">{h1}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? 'Loading…' : `${total} ${total === 1 ? 'product' : 'products'}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="md:hidden flex items-center gap-2"
            onClick={onOpenMobileFilters}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </Button>

          <SortDropdown value={filters.sort} onChange={onSortChange} />
        </div>
      </div>
    </div>
  );
}
