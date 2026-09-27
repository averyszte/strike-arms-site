import { useMemo, useState } from 'react';

import { AdminLoadError } from '@/components/admin/AdminLoadError';
import { AdminPager } from '@/components/admin/AdminPager';
import { ProductFormSheet } from '@/components/admin/ProductFormSheet';
import { ProductImportDialog } from '@/components/admin/ProductImportDialog';
import { ProductsBulkBar } from '@/components/admin/ProductsBulkBar';
import { ProductsGroups } from '@/components/admin/ProductsGroups';
import { ProductsToolbar } from '@/components/admin/ProductsToolbar';
import { StockAdjustDialog } from '@/components/admin/StockAdjustDialog';
import { useAdminProductsList } from '@/hooks/use-admin-products';
import { useProductsActions } from '@/hooks/use-products-actions';
import { useProductsExport } from '@/hooks/use-products-export';
import { useProductsFilters } from '@/hooks/use-products-filters';
import { useRowSelection } from '@/hooks/use-row-selection';
import { useToast } from '@/hooks/use-toast';
import { flattenGroups, groupProductsByCategory } from '@/lib/group-products';
import { loadErrorMessage } from '@/lib/load-error-message';
import { ADMIN_PAGE_SIZE } from '@/lib/page-bounds';
import type { Product } from '@/types/product';

/**
 * The products list: one server-side page at a time, filtered by search,
 * stock level and archived. Export and import read the whole catalogue
 * separately, whatever page is on screen.
 */

function emptyMessage(isFiltered: boolean, showArchived: boolean): string {
  if (isFiltered) return 'No products match. Clear the search or the stock filter.';
  if (showArchived) return 'Nothing is archived.';
  return 'No products yet. Click “Add Product” to create one.';
}

export function ProductsTable() {
  const filters = useProductsFilters();
  const list = useAdminProductsList(filters.filters);
  const { exportProducts, isExporting } = useProductsExport();
  const { toast } = useToast();

  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const [importing, setImporting] = useState(false);

  const groups = useMemo(() => groupProductsByCategory(list.data?.items ?? []), [list.data]);
  const visible = useMemo(() => flattenGroups(groups), [groups]);
  const selection = useRowSelection(visible);
  const actions = useProductsActions(selection.clear);

  function handleExport() {
    exportProducts().catch((error: unknown) =>
      toast({ title: 'Export failed', description: loadErrorMessage(error), variant: 'destructive' }),
    );
  }

  if (list.isError) {
    return (
      <AdminLoadError
        what="the products"
        error={list.error}
        isRetrying={list.isFetching}
        onRetry={() => void list.refetch()}
      />
    );
  }

  if (list.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-7 w-7 animate-spin rounded-full border-b-2 border-accent" />
      </div>
    );
  }

  const ids = selection.selectedIds;
  const total = list.data?.total ?? 0;
  const isFiltered = filters.query !== '' || filters.stock !== 'all';

  return (
    <>
      <ProductsToolbar
        total={total}
        showArchived={filters.showArchived}
        stock={filters.stock}
        query={filters.query}
        isExporting={isExporting}
        onToggleArchived={filters.toggleArchived}
        onStockChange={filters.setStock}
        onQueryChange={filters.setQuery}
        onExport={handleExport}
        onImport={() => setImporting(true)}
        onAdd={() => setAdding(true)}
      />

      {ids.length > 0 && (
        <ProductsBulkBar
          selected={selection.selectedRows}
          isPending={actions.isPending}
          isArchivedView={filters.showArchived}
          onClear={selection.clear}
          onPatch={(patch) => actions.patch(ids, patch)}
          onArchive={() => actions.archive(ids)}
          onRestore={() => actions.restore(ids)}
        />
      )}

      <ProductsGroups
        groups={groups}
        emptyMessage={emptyMessage(isFiltered, filters.showArchived)}
        groupState={selection.groupState}
        isSelected={selection.isSelected}
        onToggleSelect={selection.toggle}
        onToggleGroup={selection.toggleMany}
        onEdit={setEditing}
        onAdjustStock={setAdjusting}
        onArchiveToggle={(product) =>
          product.isArchived ? actions.restoreOne(product) : actions.archiveOne(product)
        }
      />

      <AdminPager
        page={filters.page}
        pageSize={ADMIN_PAGE_SIZE}
        total={total}
        noun="products"
        isFetching={list.isFetching}
        onPageChange={filters.setPage}
      />

      <ProductFormSheet open={adding} onClose={() => setAdding(false)} />
      <ProductFormSheet
        key={editing?.id ?? 'none'}
        open={!!editing}
        onClose={() => setEditing(null)}
        product={editing ?? undefined}
      />
      <ProductImportDialog open={importing} onClose={() => setImporting(false)} />
      <StockAdjustDialog
        key={adjusting?.id ?? 'none'}
        product={adjusting}
        onClose={() => setAdjusting(null)}
      />
    </>
  );
}
