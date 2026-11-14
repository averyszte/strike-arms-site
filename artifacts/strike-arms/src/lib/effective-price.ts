/**
 * The price a customer pays for one unit: the sale price when there is one and
 * it is genuinely lower than the list price, otherwise the list price.
 *
 * This is the one client copy of the rule (W-01). The other copies are:
 *   - supabase/functions/create-checkout-session/order-lines.ts (Deno cannot
 *     import from src/), which uses the same "sale below price" test;
 *   - create_counter_order in supabase/migrations/038_simple_stock.sql;
 *   - the generated column products.effective_price_cents (009), which is
 *     coalesce(sale, price).
 * The coalesce copy agrees with this one because migration 001 enforces
 * sale_price_cents < price_cents (M-025).
 */
export function effectivePriceCents(priceCents: number, salePriceCents?: number | null): number {
  return salePriceCents != null && salePriceCents < priceCents ? salePriceCents : priceCents;
}

/** True when a sale price is set and undercuts the list price. */
export function hasDiscount(priceCents: number, salePriceCents?: number | null): boolean {
  return salePriceCents != null && salePriceCents < priceCents;
}
