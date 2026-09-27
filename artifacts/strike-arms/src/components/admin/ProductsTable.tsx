import { useMemo } from 'react';

import { AdminLoadError } from '@/components/admin/AdminLoadError';
import { AdminPager } from '@/components/admin/AdminPager';
import { ProductsBulkBar } from '@/components/admin/ProductsBulkBar';
import { ProductsDialogs } from '@/components/admin/ProductsDialogs';
import { ProductsGroups } from '@/components/admin/ProductsGroups';
import { ProductsToolbar } from '@/components/admin/ProductsToolbar';
import { useAdminProductsList } from '@/hooks/use-admin-products';
import { useProductsActions } from '@/hooks/use-products-actions';
import { useProductsDialogs } from '@/hooks/use-products-dialogs';
import { useProductsExport } from '@/hooks/use-products-export';
import { useProductsFilters } from '@/hooks/use-products-filters';
import { usePageClamp } from '@/hooks/use-page-clamp';
import { useRowSelection } from '@/hooks/use-row-selection';
import { flattenGroups, groupProductsByCategory } from '@/lib/group-products';
import { ADMIN_PAGE_SIZE } from '@/lib/page-bounds';

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
  const dialogs = useProductsDialogs();
  const groups = useMemo(() => groupProductsByCategory(list.data?.items ?? []), [list.data]);
  const visible = useMemo(() => flattenGroups(groups), [groups]);
  const selection = useRowSelection(visible);
  const actions = useProductsActions(selection.clear);
  const settledTotal = list.isFetching ? undefined : list.data?.total;
  usePageClamp(filters.page, ADMIN_PAGE_SIZE, settledTotal, filters.setPage);

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
        filters={filters}
        isExporting={isExporting}
        onExport={exportProducts}
        onImport={dialogs.importCsv}
        onAdd={dialogs.add}
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
        onEdit={dialogs.edit}
        onAdjustStock={dialogs.adjustStock}
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
      <ProductsDialogs dialogs={dialogs} />
    </>
  );
}
