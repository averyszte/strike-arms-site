import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SortDropdown } from './SortDropdown';
import type { ProductFilters } from '@/types/product';

interface ResultsHeaderProps {
  total: number;
  isLoading: boolean;
  filters: ProductFilters;
  onSortChange: (sort: ProductFilters['sort']) => void;
  onOpenMobileFilters: () => void;
}

/** Toolbar above the product grid: result count, mobile filters, sort. */
export function ResultsHeader({
  total,
  isLoading,
  filters,
  onSortChange,
  onOpenMobileFilters,
}: ResultsHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
        {isLoading ? 'Loading…' : `${total} ${total === 1 ? 'product' : 'products'}`}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 font-bold uppercase tracking-wider md:hidden"
          onClick={onOpenMobileFilters}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>

        <SortDropdown value={filters.sort} onChange={onSortChange} />
      </div>
    </div>
  );
}
