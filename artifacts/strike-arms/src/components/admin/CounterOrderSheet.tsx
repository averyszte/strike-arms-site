import { useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { CounterOrderCustomerFields } from '@/components/admin/CounterOrderCustomerFields';
import { CounterOrderLines } from '@/components/admin/CounterOrderLines';
import { CounterOrderProductPicker } from '@/components/admin/CounterOrderProductPicker';
import { CounterOrderStockPrompt, type SoldProduct } from '@/components/admin/CounterOrderStockPrompt';
import { CounterOrderTotals } from '@/components/admin/CounterOrderTotals';
import { useAdminProducts } from '@/hooks/use-admin-products';
import { useCreateCounterOrder } from '@/hooks/use-create-counter-order';
import { useStoreRates } from '@/hooks/use-store-rates';
import { useToast } from '@/hooks/use-toast';
import {
  EMPTY_COUNTER_ORDER_DRAFT,
  draftToCounterOrderInput,
  validateCounterOrder,
  type CounterOrderFieldErrors,
} from '@/lib/counter-order-draft';
import { calculateCounterTotals, resolveCounterLines } from '@/lib/counter-order-totals';
import { formatPrice } from '@/lib/format-price';
import type { CounterOrderDraft, CounterOrderLine, ItemFulfillmentMethod } from '@/types/order';
import type { Product } from '@/types/product';

/**
 * Ringing up a sale made in the shop or over the phone.
 *
 * The order is created and marked paid in one call, because it already has
 * been paid — Alan is holding the money. Nothing here decides an amount: the
 * totals shown are a preview of what create_counter_order will work out from
 * the catalogue, and the sale is written by that function alone.
 */

type CounterOrderSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function CounterOrderSheet({ open, onClose }: CounterOrderSheetProps) {
  const [lines, setLines] = useState<CounterOrderLine[]>([]);
  const [draft, setDraft] = useState<CounterOrderDraft>(EMPTY_COUNTER_ORDER_DRAFT);
  const [errors, setErrors] = useState<CounterOrderFieldErrors>({});
  const [soldProducts, setSoldProducts] = useState<SoldProduct[] | null>(null);

  const {
    data: products = [],
    isLoading: isLoadingProducts,
    isError: isProductsError,
  } = useAdminProducts();
  const { data: rates } = useStoreRates();
  const createOrder = useCreateCounterOrder();
  const { toast } = useToast();

  const resolved = useMemo(() => resolveCounterLines(lines, products), [lines, products]);
  // Archived products are off sale; they stay in `products` only so lines resolve.
  const pickable = useMemo(() => products.filter((product) => !product.isArchived), [products]);
  const totals = useMemo(() => calculateCounterTotals(resolved, rates), [resolved, rates]);

  const addedIds = useMemo(
    () => new Set(resolved.map((line) => line.productId)),
    [resolved],
  );

  function patchDraft(update: Partial<CounterOrderDraft>) {
    setDraft((current) => ({ ...current, ...update }));
  }

  function addProduct(product: Product) {
    setLines((current) => [
      ...current,
      {
        productId: product.id,
        quantity: 1,
        // Collection is the safe default: it is the only method every product
        // supports, and it is what actually happens at a counter.
        fulfillmentMethod: 'pickup',
      },
    ]);
  }

  function patchLine(productId: string, update: Partial<CounterOrderLine>) {
    setLines((current) =>
      current.map((line) => (line.productId === productId ? { ...line, ...update } : line)),
    );
  }

  function removeLine(productId: string) {
    setLines((current) => current.filter((line) => line.productId !== productId));
  }

  function reset() {
    setLines([]);
    setDraft(EMPTY_COUNTER_ORDER_DRAFT);
    setErrors({});
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const found = validateCounterOrder(draft, resolved, totals.hasDeliveryLines);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Submitted from the resolved list, not the raw draft: a product deleted
    // while the sheet was open is not in it, and so is not sold.
    const submitted: CounterOrderLine[] = resolved.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      fulfillmentMethod: line.fulfillmentMethod,
    }));

    try {
      const result = await createOrder.mutateAsync(
        draftToCounterOrderInput(draft, submitted, totals.hasDeliveryLines),
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
      const stillListed = resolved
        .filter((line) => line.product.inStock && !outOfStock.has(line.product.name))
        .map((line) => ({ id: line.product.id, name: line.product.name }));
      if (stillListed.length > 0) setSoldProducts(stillListed);
      handleClose();
    } catch (error: unknown) {
      toast({
        title: 'Could not record the sale',
        description: error instanceof Error ? error.message : 'Something went wrong.',
        variant: 'destructive',
      });
    }
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(next) => {
          if (!next) handleClose();
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-[560px]">
          <SheetHeader>
            <SheetTitle>New counter sale</SheetTitle>
            <SheetDescription>
              Records a sale already paid for in the shop or over the phone.
            </SheetDescription>
          </SheetHeader>

          <form className="mt-5 space-y-5" onSubmit={handleSubmit} noValidate>
            <CounterOrderProductPicker
              products={pickable}
              isLoading={isLoadingProducts}
              addedIds={addedIds}
              onAdd={addProduct}
            />

            {isProductsError && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                The catalogue could not be loaded, so nothing can be added. Close this and try again.
              </p>
            )}

            {errors.lines && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {errors.lines}
              </p>
            )}

            <CounterOrderLines
              lines={resolved}
              onQuantityChange={(productId, quantity) => patchLine(productId, { quantity })}
              onMethodChange={(productId, method: ItemFulfillmentMethod) =>
                patchLine(productId, { fulfillmentMethod: method })
              }
              onRemove={removeLine}
            />

            <Separator />

            <CounterOrderCustomerFields
              draft={draft}
              errors={errors}
              hasDeliveryLines={totals.hasDeliveryLines}
              onPatch={patchDraft}
            />

            <Separator />

            <CounterOrderTotals totals={totals} />

            <div className="sticky bottom-0 flex gap-2 border-t border-border bg-background pb-2 pt-3">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={createOrder.isPending}>
                {createOrder.isPending ? 'Saving…' : 'Record sale'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
      {soldProducts && (
        <CounterOrderStockPrompt products={soldProducts} onClose={() => setSoldProducts(null)} />
      )}
    </>
  );
}
