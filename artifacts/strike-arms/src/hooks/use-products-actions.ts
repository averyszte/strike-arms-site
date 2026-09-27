import { useBulkUpdateProducts, useSetProductsArchived } from '@/hooks/use-admin-products';
import { useToast } from '@/hooks/use-toast';
import { loadErrorMessage } from '@/lib/load-error-message';
import type { Product, ProductBulkPatch } from '@/types/product';

/**
 * The writes the products list makes, with their toasts.
 *
 * Every one of them is undoable from the same screen -- archive has restore,
 * publish has unpublish -- so none of them asks first. The bulk bar still asks
 * before publishing products that would go on the shop looking broken.
 */

function plural(count: number): string {
  return `${count} product${count === 1 ? '' : 's'}`;
}

export function useProductsActions(onDone: () => void) {
  const bulkUpdate = useBulkUpdateProducts();
  const setArchived = useSetProductsArchived();
  const { toast } = useToast();

  function failed(title: string, error: unknown) {
    toast({ title, description: loadErrorMessage(error), variant: 'destructive' });
  }

  async function patch(ids: string[], change: ProductBulkPatch) {
    try {
      await bulkUpdate.mutateAsync({ ids, patch: change });
      onDone();
      toast({ title: `${plural(ids.length)} updated` });
    } catch (error) {
      // Chunked, so earlier batches may have gone through.
      failed('Not every selected product was changed', error);
    }
  }

  async function archive(ids: string[], isArchived: boolean) {
    try {
      await setArchived.mutateAsync({ ids, isArchived });
      onDone();
      toast({ title: `${plural(ids.length)} ${isArchived ? 'archived' : 'restored as drafts'}` });
    } catch (error) {
      failed(`Not every product was ${isArchived ? 'archived' : 'restored'}`, error);
    }
  }

  return {
    isPending: bulkUpdate.isPending || setArchived.isPending,
    patch: (ids: string[], change: ProductBulkPatch) => void patch(ids, change),
    archive: (ids: string[]) => void archive(ids, true),
    restore: (ids: string[]) => void archive(ids, false),
    archiveOne: (product: Product) => void archive([product.id], true),
    restoreOne: (product: Product) => void archive([product.id], false),
  };
}
