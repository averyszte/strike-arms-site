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
import type { ProductFilters } from '@/types/product';

interface ResultsHeaderProps {
  categoryName: string;
  total: number;
  isLoading: boolean;
  filters: ProductFilters;
  onSortChange: (sort: ProductFilters['sort']) => void;
  onOpenMobileFilters: () => void;
}

export function ResultsHeader({
  categoryName,
  total,
  isLoading,
  filters,
  onSortChange,
  onOpenMobileFilters,
}: ResultsHeaderProps) {
  return (
    <div className="space-y-3 pb-5 border-b border-border">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{categoryName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground leading-tight">{categoryName}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? 'Loading…' : `${total} ${total === 1 ? 'product' : 'products'}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile: show filters button */}
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
