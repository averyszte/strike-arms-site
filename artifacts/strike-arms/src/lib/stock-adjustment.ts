/** Whether stock is coming in or going out. Kept out of the sign so the field
 *  cannot hold "-3" going out and mean +3. */
export type StockDirection = 'in' | 'out';

export type StockAdjustmentForm = {
  direction: StockDirection;
  quantity: string;
  reason: string;
};

export const EMPTY_STOCK_ADJUSTMENT: StockAdjustmentForm = {
  direction: 'in',
  quantity: '',
  reason: '',
};

/** Fills the reason field in one tap. Free text still wins if none of them fit. */
export const STOCK_REASONS = [
  'Delivery received',
  'Stocktake correction',
  'Damaged',
  'Sold at counter',
  'Returned by customer',
] as const;

export type StockAdjustmentErrors = Partial<Record<'quantity' | 'reason', string>>;

const MIN_REASON_LENGTH = 3;

// Digits and nothing else. Number() alone would accept "1e3" as a perfectly
// good integer and quietly book a thousand units, and the field takes pasted
// text, so what is typed has to be checked rather than what it parses to.
const WHOLE_NUMBER = /^\d+$/;

/** The signed number the RPC wants: positive restocks, negative deducts. */
export function toSignedAdjustment(form: StockAdjustmentForm): number {
  const quantity = Number(form.quantity);
  return form.direction === 'out' ? -quantity : quantity;
}

/**
 * Checks an adjustment before it is applied.
 *
 * `adjust_stock` will happily add a negative straight through zero, and
 * negative stock is a lie the shop then acts on. Worse, units between the
 * reserved count and zero are already promised to somebody mid-payment, so
 * removing them oversells a checkout that is still open -- the floor is the
 * reserved count, not zero.
 *
 * A reason is required because an audit trail of blank strings answers nothing
 * six months later, which is the only time anyone reads it.
 */
export function validateStockAdjustment(
  form: StockAdjustmentForm,
  stockCount: number,
  reservedCount: number,
): StockAdjustmentErrors {
  const errors: StockAdjustmentErrors = {};
  const quantity = Number(form.quantity);

  if (!WHOLE_NUMBER.test(form.quantity.trim()) || quantity <= 0) {
    errors.quantity = 'Enter a whole number of units, at least 1';
  } else if (form.direction === 'out') {
    const removable = stockCount - reservedCount;
    if (quantity > removable) {
      errors.quantity =
        reservedCount > 0
          ? `Only ${removable} can come out — ${reservedCount} of ${stockCount} are reserved for open checkouts`
          : `Only ${removable} in stock`;
    }
  }

  if (form.reason.trim().length < MIN_REASON_LENGTH) {
    errors.reason = 'Say why, so the history means something later';
  }

  return errors;
}
