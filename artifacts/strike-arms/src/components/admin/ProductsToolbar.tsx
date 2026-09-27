import { Archive, Download, Plus, Upload } from 'lucide-react';

import { AdminSearchBox } from '@/components/admin/AdminSearchBox';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { useProductsFilters } from '@/hooks/use-products-filters';
import { STOCK_FILTER_LABELS } from '@/lib/stock-levels';
import type { ProductStockFilter } from '@/types/product';

/** The controls above the products list. Holds no state of its own. */

const STOCK_FILTERS: ProductStockFilter[] = ['all', 'low', 'out'];

type ProductsToolbarProps = {
  total: number;
  filters: ReturnType<typeof useProductsFilters>;
  isExporting: boolean;
  onExport: () => void;
  onImport: () => void;
  onAdd: () => void;
};

export function ProductsToolbar({
  total,
  filters,
  isExporting,
  onExport,
  onImport,
  onAdd,
}: ProductsToolbarProps) {
  const { showArchived, stock, query } = filters;
  return (
    <div className="mb-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          {showArchived ? 'Archived products' : 'Products'} ({total})
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={showArchived ? 'default' : 'outline'}
            aria-pressed={showArchived}
            onClick={filters.toggleArchived}
          >
            <Archive className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Archived
          </Button>
          {/* The whole catalogue, not the page on screen: the file is for
              editing and importing back. */}
          <Button size="sm" variant="outline" disabled={isExporting} onClick={onExport}>
            <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Export CSV
          </Button>
          <Button size="sm" variant="outline" onClick={onImport}>
            <Upload className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Import CSV
          </Button>
          <Button size="sm" onClick={onAdd}>
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Add Product
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Addressable, so the dashboard's stock alerts land on exactly the
            products they count. */}
        <Select value={stock} onValueChange={(value) => filters.setStock(value as ProductStockFilter)}>
          <SelectTrigger className="h-9 w-52 text-xs" aria-label="Stock">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STOCK_FILTERS.map((filter) => (
              <SelectItem key={filter} value={filter} className="text-xs">
                {STOCK_FILTER_LABELS[filter]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AdminSearchBox
          value={query}
          label="Search products"
          placeholder="Name, brand, tag or slug"
          onSearch={filters.setQuery}
        />
      </div>

      {showArchived && (
        <p className="mt-3 text-xs text-muted-foreground">
          Archived products are off the shop and out of the counter sale picker. Their stock
          history and past orders are kept. Restoring one brings it back as a draft.
        </p>
      )}
    </div>
  );
}
