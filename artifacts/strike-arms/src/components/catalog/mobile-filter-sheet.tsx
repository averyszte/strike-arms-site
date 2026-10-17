import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { FilterSidebarContent } from '@/components/catalog/FilterSidebar';
import type { CategorySlug } from '@/lib/taxonomy';
import type { ProductFilters } from '@/types/product';

/**
 * The sidebar as a drawer on phones. Filters apply as they are ticked; the
 * pinned button says how many products that leaves and closes the drawer,
 * so nobody has to hunt for the way back to the grid.
 */

interface MobileFilterSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  total: number;
  isFetching: boolean;
  activeCategorySlug?: CategorySlug;
  activeSubcategorySlug?: string;
  filters: ProductFilters;
  onFilterChange: (patch: Partial<ProductFilters>) => void;
}

export function MobileFilterSheet({
  isOpen,
  onOpenChange,
  total,
  isFetching,
  activeCategorySlug,
  activeSubcategorySlug,
  filters,
  onFilterChange,
}: MobileFilterSheetProps) {
  const close = () => onOpenChange(false);
  const label = total === 1 ? 'Show 1 product' : `Show ${total} products`;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-[300px] flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="font-black uppercase tracking-tight">Filters</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6">
          <FilterSidebarContent
            idPrefix="mobile-filter"
            activeCategorySlug={activeCategorySlug}
            activeSubcategorySlug={activeSubcategorySlug}
            filters={filters}
            onFilterChange={onFilterChange}
            onNavigate={close}
          />
        </div>
        <div className="border-t border-border bg-background px-6 py-4">
          <Button className="w-full font-bold uppercase tracking-wider" onClick={close}>
            {isFetching ? 'Updating…' : label}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
