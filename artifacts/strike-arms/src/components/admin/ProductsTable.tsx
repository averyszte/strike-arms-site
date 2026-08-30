import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Accordion } from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ProductFormSheet } from '@/components/admin/ProductFormSheet';
import { ProductsBulkBar } from '@/components/admin/ProductsBulkBar';
import { ProductsTableGroup } from '@/components/admin/ProductsTableGroup';
import { StockAdjustDialog } from '@/components/admin/StockAdjustDialog';
import {
  useAdminProducts,
  useBulkDeleteProducts,
  useBulkUpdateProducts,
  useDeleteProduct,
} from '@/hooks/use-admin-products';
import { useRowSelection } from '@/hooks/use-row-selection';
import { useToast } from '@/hooks/use-toast';
import { flattenGroups, groupProductsByCategory } from '@/lib/group-products';
import type { Product, ProductBulkPatch } from '@/types/product';

export function ProductsTable() {
  const { data: products, isLoading } = useAdminProducts();
  const deleteProduct = useDeleteProduct();
  const bulkUpdate = useBulkUpdateProducts();
  const bulkDelete = useBulkDeleteProducts();
  const { toast } = useToast();

  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [adjusting, setAdjusting] = useState<Product | null>(null);

  const groups = useMemo(() => groupProductsByCategory(products ?? []), [products]);
  const visible = useMemo(() => flattenGroups(groups), [groups]);
  const selection = useRowSelection(visible);

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteProduct.mutateAsync(deleting.id);
      toast({ title: 'Product deleted' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    } finally {
      setDeleting(null);
    }
  }

  async function handleBulkPatch(patch: ProductBulkPatch) {
    const count = selection.selectedIds.length;
    try {
      await bulkUpdate.mutateAsync({ ids: selection.selectedIds, patch });
      selection.clear();
      toast({ title: `${count} product${count === 1 ? '' : 's'} updated` });
    } catch (error) {
      toast({
        title: 'Nothing was changed',
        description: error instanceof Error ? error.message : 'The update failed.',
        variant: 'destructive',
      });
    }
  }

  async function handleBulkDelete() {
    const count = selection.selectedIds.length;
    try {
      await bulkDelete.mutateAsync(selection.selectedIds);
      selection.clear();
      toast({ title: `${count} product${count === 1 ? '' : 's'} deleted` });
    } catch (error) {
      toast({
        title: 'Nothing was deleted',
        description: error instanceof Error ? error.message : 'The delete failed.',
        variant: 'destructive',
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-7 w-7 animate-spin rounded-full border-b-2 border-accent" />
      </div>
    );
  }

  const isPending = bulkUpdate.isPending || bulkDelete.isPending;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          Products ({products?.length ?? 0})
        </h2>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {selection.selectedIds.length > 0 && (
        <ProductsBulkBar
          selected={selection.selectedRows}
          isPending={isPending}
          onClear={selection.clear}
          onPatch={(patch) => void handleBulkPatch(patch)}
          onDelete={() => void handleBulkDelete()}
        />
      )}

      {groups.length === 0 ? (
        <div className="rounded-md border border-border px-4 py-12 text-center text-muted-foreground">
          No products yet. Click &ldquo;Add Product&rdquo; to create one.
        </div>
      ) : (
        <Accordion type="multiple" defaultValue={[]} className="space-y-2">
          {groups.map((group) => (
            <ProductsTableGroup
              key={group.category}
              category={group.category}
              label={group.label}
              products={group.products}
              selectionState={selection.groupState(group.products.map((p) => p.id))}
              isSelected={selection.isSelected}
              onToggleSelect={selection.toggle}
              onToggleGroup={selection.toggleMany}
              onEdit={setEditing}
              onAdjustStock={setAdjusting}
              onDelete={setDeleting}
            />
          ))}
        </Accordion>
      )}

      <ProductFormSheet open={adding} onClose={() => setAdding(false)} />
      <ProductFormSheet
        key={editing?.id ?? 'none'}
        open={!!editing}
        onClose={() => setEditing(null)}
        product={editing ?? undefined}
      />

      <StockAdjustDialog
        key={adjusting?.id ?? 'none'}
        product={adjusting}
        onClose={() => setAdjusting(null)}
      />

      <AlertDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleting?.name}&rdquo; will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
