import { useCreateCounterOrder } from '@/hooks/use-create-counter-order';
import { useToast } from '@/hooks/use-toast';
import { draftToCounterOrderInput } from '@/lib/counter-order-draft';
import type { ResolvedCounterLine } from '@/lib/counter-order-totals';
import { formatPrice } from '@/lib/format-price';
import type { CounterOrderDraft, CounterOrderLine } from '@/types/order';

/** A product the sale used up that the website still lists as in stock. */
export type StillListedProduct = { id: string; name: string };

/**
 * Writes a counter sale and toasts the outcome. Resolves to the products the
 * website still lists as in stock, or null when the sale was not recorded.
 */
export function useRecordCounterSale() {
  const createOrder = useCreateCounterOrder();
  const { toast } = useToast();

  async function recordSale(
    draft: CounterOrderDraft,
    resolved: ResolvedCounterLine[],
    hasDeliveryLines: boolean,
  ): Promise<StillListedProduct[] | null> {
    // Submitted from the resolved list, not the raw draft: a product deleted
    // while the sheet was open is not in it, and so is not sold.
    const submitted: CounterOrderLine[] = resolved.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      fulfillmentMethod: line.fulfillmentMethod,
    }));

    try {
      const result = await createOrder.mutateAsync(
        draftToCounterOrderInput(draft, submitted, hasDeliveryLines),
      );
      // The server's total, not the preview: they differ if a price changed
      // while the sheet was open (M-022).
      const warning =
        result.outOfStock.length > 0
          ? ` The website lists ${result.outOfStock.join(', ')} as out of stock: check the shelf.`
          : '';
      toast({
        title: 'Sale recorded',
        description: `Order ${result.orderNumber ?? ''} for ${formatPrice(result.totalCents)}.${warning}`,
      });
      const outOfStock = new Set(result.outOfStock);
      return resolved
        .filter((line) => line.product.inStock && !outOfStock.has(line.product.name))
        .map((line) => ({ id: line.product.id, name: line.product.name }));
    } catch (error: unknown) {
      toast({
        title: 'Could not record the sale',
        description: error instanceof Error ? error.message : 'Something went wrong.',
        variant: 'destructive',
      });
      return null;
    }
  }

  return { recordSale, isPending: createOrder.isPending };
}
