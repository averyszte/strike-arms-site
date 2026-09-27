import { ProductFormSheet } from '@/components/admin/ProductFormSheet';
import { ProductImportDialog } from '@/components/admin/ProductImportDialog';
import { StockAdjustDialog } from '@/components/admin/StockAdjustDialog';
import type { useProductsDialogs } from '@/hooks/use-products-dialogs';

/** The products screen's sheets and dialogs; which is open lives in useProductsDialogs. */

type ProductsDialogsProps = { dialogs: ReturnType<typeof useProductsDialogs> };

export function ProductsDialogs({ dialogs }: ProductsDialogsProps) {
  const { editing, adjusting } = dialogs;
  return (
    <>
      <ProductFormSheet open={dialogs.isAdding} onClose={dialogs.close} />
      <ProductFormSheet
        key={editing?.id ?? 'none'}
        open={!!editing}
        onClose={dialogs.close}
        product={editing ?? undefined}
      />
      <ProductImportDialog open={dialogs.isImporting} onClose={dialogs.close} />
      <StockAdjustDialog key={adjusting?.id ?? 'none'} product={adjusting} onClose={dialogs.close} />
    </>
  );
}
