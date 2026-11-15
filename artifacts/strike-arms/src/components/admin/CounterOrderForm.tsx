import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CounterOrderCustomerFields } from '@/components/admin/CounterOrderCustomerFields';
import { CounterOrderLines } from '@/components/admin/CounterOrderLines';
import { CounterOrderProductPicker } from '@/components/admin/CounterOrderProductPicker';
import { CounterOrderTotals } from '@/components/admin/CounterOrderTotals';
import type { CounterOrderSheetState } from '@/hooks/use-counter-order-sheet';
import type { ItemFulfillmentMethod } from '@/types/order';

/** The body of the counter sale sheet: products, lines, customer and totals. */
export function CounterOrderForm({ state }: { state: CounterOrderSheetState }) {
  return (
    <form className="mt-5 space-y-5" onSubmit={state.handleSubmit} noValidate>
      <CounterOrderProductPicker
        products={state.pickable}
        isLoading={state.isLoadingProducts}
        addedIds={state.addedIds}
        onAdd={state.addProduct}
      />

      {state.isProductsError && (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          The catalogue could not be loaded, so nothing can be added. Close this and try again.
        </p>
      )}

      {state.errors.lines && (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {state.errors.lines}
        </p>
      )}

      <CounterOrderLines
        lines={state.resolved}
        onQuantityChange={(productId, quantity) => state.patchLine(productId, { quantity })}
        onMethodChange={(productId, method: ItemFulfillmentMethod) =>
          state.patchLine(productId, { fulfillmentMethod: method })
        }
        onRemove={state.removeLine}
      />

      <Separator />

      <CounterOrderCustomerFields
        draft={state.draft}
        errors={state.errors}
        hasDeliveryLines={state.totals.hasDeliveryLines}
        onPatch={state.patchDraft}
      />

      <Separator />

      <CounterOrderTotals totals={state.totals} />

      <div className="sticky bottom-0 flex gap-2 border-t border-border bg-background pb-2 pt-3">
        <Button type="button" variant="outline" className="flex-1" onClick={state.requestClose}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={state.isPending}>
          {state.isPending ? 'Saving…' : 'Record sale'}
        </Button>
      </div>
    </form>
  );
}
