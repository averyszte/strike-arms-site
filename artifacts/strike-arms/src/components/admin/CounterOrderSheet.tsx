import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { CounterOrderDiscardDialog } from '@/components/admin/CounterOrderDiscardDialog';
import { CounterOrderForm } from '@/components/admin/CounterOrderForm';
import { CounterOrderStockPrompt } from '@/components/admin/CounterOrderStockPrompt';
import { useCounterOrderSheet } from '@/hooks/use-counter-order-sheet';

/**
 * Ringing up a sale made in the shop or over the phone.
 *
 * The order is created and marked paid in one call, because it already has
 * been paid — Alan is holding the money. Nothing here decides an amount: the
 * totals shown are a preview of what create_counter_order will work out from
 * the catalogue, and the sale is written by that function alone.
 *
 * The state and handlers live in useCounterOrderSheet, the form body in
 * CounterOrderForm.
 */

type CounterOrderSheetProps = {
  open: boolean;
  onClose: () => void;
};

export function CounterOrderSheet({ open, onClose }: CounterOrderSheetProps) {
  const state = useCounterOrderSheet(onClose);

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(next) => {
          if (!next) state.requestClose();
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-[560px]">
          <SheetHeader>
            <SheetTitle>New counter sale</SheetTitle>
            <SheetDescription>
              Records a sale already paid for in the shop or over the phone.
            </SheetDescription>
          </SheetHeader>
          <CounterOrderForm state={state} />
        </SheetContent>
      </Sheet>
      <CounterOrderDiscardDialog
        open={state.isConfirmingDiscard}
        onKeep={state.keepEditing}
        onDiscard={state.handleClose}
      />
      {state.soldProducts && (
        <CounterOrderStockPrompt products={state.soldProducts} onClose={state.clearSoldProducts} />
      )}
    </>
  );
}
