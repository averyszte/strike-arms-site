import { useBulkUpdateProducts } from '@/hooks/use-bulk-update-products';
import { useSetProductsArchived } from '@/hooks/use-set-products-archived';
import { useToast } from '@/hooks/use-toast';
import { adminErrorMessage, failedItemsMessage } from '@/lib/admin-error-message';
import type { Product, ProductBulkPatch } from '@/types/product';

/**
 * The writes the products list makes, with their toasts.
 *
 * The bulk bar confirms with the count first (M-037). Archiving then offers
 * Undo, which puts back the published and featured flags the archive took
 * off; a later restore from Archived still brings products back as drafts.
 * A failure names the products that did not change (M-040).
 */

/** What a toast takes as its action, read off useToast so no UI is imported here. */
type ToastAction = Parameters<ReturnType<typeof useToast>['toast']>[0]['action'];

/** Renders the toast's Undo button. Passed in: a hook may not import components. */
export type UndoActionFactory = (onUndo: () => void) => ToastAction;

type ArchivedFlags = { id: string; isPublished: boolean; isFeatured: boolean };

function plural(count: number): string {
  return `${count} product${count === 1 ? '' : 's'}`;
}

export function useProductsActions(onDone: () => void, undoAction: UndoActionFactory) {
  const bulkUpdate = useBulkUpdateProducts();
  const setArchived = useSetProductsArchived();
  const { toast } = useToast();

  function failed(title: string, error: unknown, products: Product[]) {
    const names = new Map(products.map(p => [p.id, p.name]));
    const description = failedItemsMessage(error, id => names.get(id), adminErrorMessage(error));
    toast({ title, description, variant: 'destructive' });
  }

  async function patch(products: Product[], change: ProductBulkPatch) {
    try {
      await bulkUpdate.mutateAsync({ ids: products.map(p => p.id), patch: change });
      onDone();
      toast({ title: `${plural(products.length)} updated` });
    } catch (error) {
      failed('Not every selected product was changed', error, products);
    }
  }

  // One row's switch: no selection to clear, and the toast names the product.
  async function toggleStock(product: Product) {
    const inStock = !product.inStock;
    try {
      await bulkUpdate.mutateAsync({ ids: [product.id], patch: { inStock } });
      toast({ title: `${product.name} marked ${inStock ? 'in stock' : 'out of stock'}` });
    } catch (error) {
      failed('Stock was not changed', error, [product]);
    }
  }

  async function undoArchive(flags: ArchivedFlags[]) {
    try {
      await setArchived.mutateAsync({ ids: flags.map(f => f.id), isArchived: false });
      const published = flags.filter(f => f.isPublished).map(f => f.id);
      const featured = flags.filter(f => f.isFeatured).map(f => f.id);
      if (published.length > 0) await bulkUpdate.mutateAsync({ ids: published, patch: { isPublished: true } });
      if (featured.length > 0) await bulkUpdate.mutateAsync({ ids: featured, patch: { isFeatured: true } });
      toast({ title: `${plural(flags.length)} put back as they were` });
    } catch (error) {
      toast({ title: 'Undo did not finish', description: adminErrorMessage(error), variant: 'destructive' });
    }
  }

  async function archive(products: Product[], isArchived: boolean) {
    const flags: ArchivedFlags[] = products.map(p => ({
      id: p.id,
      isPublished: p.isPublished === true,
      isFeatured: p.isFeatured === true,
    }));
    try {
      await setArchived.mutateAsync({ ids: flags.map(f => f.id), isArchived });
      onDone();
      toast({
        title: `${plural(products.length)} ${isArchived ? 'archived' : 'restored as drafts'}`,
        action: isArchived ? undoAction(() => void undoArchive(flags)) : undefined,
      });
    } catch (error) {
      failed(`Not every product was ${isArchived ? 'archived' : 'restored'}`, error, products);
    }
  }

  return {
    isPending: bulkUpdate.isPending || setArchived.isPending,
    patch: (products: Product[], change: ProductBulkPatch) => void patch(products, change),
    archive: (products: Product[]) => void archive(products, true),
    restore: (products: Product[]) => void archive(products, false),
    toggleStockOne: (product: Product) => void toggleStock(product),
    archiveOne: (product: Product) => void archive([product], true),
    restoreOne: (product: Product) => void archive([product], false),
  };
}
