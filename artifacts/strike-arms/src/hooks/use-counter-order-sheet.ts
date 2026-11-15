import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import { useAdminProducts } from '@/hooks/use-admin-products';
import { useCounterOrderLines } from '@/hooks/use-counter-order-lines';
import { useRecordCounterSale } from '@/hooks/use-record-counter-sale';
import { useStoreRates } from '@/hooks/use-store-rates';
import {
  EMPTY_COUNTER_ORDER_DRAFT,
  validateCounterOrder,
  type CounterOrderFieldErrors,
} from '@/lib/counter-order-draft';
import { calculateCounterTotals } from '@/lib/counter-order-totals';
import type { CounterOrderDraft } from '@/types/order';
import type { StillListedProduct } from '@/hooks/use-record-counter-sale';

/**
 * The state behind the counter sale sheet: the draft, its lines, the
 * discard prompt (N-079) and the submit. Split out of CounterOrderSheet so
 * the component stays inside the 80-line function limit.
 */
export function useCounterOrderSheet(onClose: () => void) {
  const [draft, setDraft] = useState<CounterOrderDraft>(EMPTY_COUNTER_ORDER_DRAFT);
  const [errors, setErrors] = useState<CounterOrderFieldErrors>({});
  const [soldProducts, setSoldProducts] = useState<StillListedProduct[] | null>(null);
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);

  const {
    data: products = [],
    isLoading: isLoadingProducts,
    isError: isProductsError,
  } = useAdminProducts();
  const { data: rates } = useStoreRates();
  const { resolved, addedIds, addProduct, patchLine, removeLine, clearLines } =
    useCounterOrderLines(products);
  const { recordSale, isPending } = useRecordCounterSale();

  // Archived products are off sale; they stay in `products` only so lines resolve.
  const pickable = useMemo(() => products.filter((product) => !product.isArchived), [products]);
  const totals = useMemo(() => calculateCounterTotals(resolved, rates), [resolved, rates]);

  function patchDraft(update: Partial<CounterOrderDraft>) {
    setDraft((current) => ({ ...current, ...update }));
  }

  function handleClose() {
    setIsConfirmingDiscard(false);
    clearLines();
    setDraft(EMPTY_COUNTER_ORDER_DRAFT);
    setErrors({});
    onClose();
  }

  // N-079: a click outside or Escape used to throw away a half-rung sale.
  function requestClose() {
    const hasWork = resolved.length > 0 || draft.customerName.trim() !== '';
    if (hasWork) setIsConfirmingDiscard(true);
    else handleClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const found = validateCounterOrder(draft, resolved, totals.hasDeliveryLines);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const stillListed = await recordSale(draft, resolved, totals.hasDeliveryLines);
    if (stillListed === null) return;
    if (stillListed.length > 0) setSoldProducts(stillListed);
    handleClose();
  }

  return {
    draft,
    errors,
    soldProducts,
    clearSoldProducts: () => setSoldProducts(null),
    isConfirmingDiscard,
    keepEditing: () => setIsConfirmingDiscard(false),
    pickable,
    isLoadingProducts,
    isProductsError,
    resolved,
    addedIds,
    addProduct,
    patchLine,
    removeLine,
    totals,
    isPending,
    patchDraft,
    handleClose,
    requestClose,
    handleSubmit,
  };
}

export type CounterOrderSheetState = ReturnType<typeof useCounterOrderSheet>;
