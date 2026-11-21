/**
 * GA4 ecommerce payloads (view_item, add_to_cart, begin_checkout, purchase).
 * Money is in euros, as GA4 expects, not cents. Pure: the push itself is in
 * data/google-tag-manager-client.ts.
 */

export const ECOMMERCE_CURRENCY = 'EUR';

export type EcommerceEventName = 'view_item' | 'add_to_cart' | 'begin_checkout' | 'purchase';

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_brand: string;
  item_category?: string;
  price: number;
  quantity: number;
};

export type EcommercePayload = {
  currency: string;
  value: number;
  items: AnalyticsItem[];
  transaction_id?: string;
};

/** What every item source (a product, a cart line) has in common. */
export type AnalyticsItemSource = {
  productId: string;
  name: string;
  brand: string;
  unitPriceCents: number;
  quantity: number;
  category?: string;
};

export function centsToEuros(cents: number): number {
  return Math.round(cents) / 100;
}

export function toAnalyticsItem(source: AnalyticsItemSource): AnalyticsItem {
  return {
    item_id: source.productId,
    item_name: source.name,
    item_brand: source.brand,
    ...(source.category ? { item_category: source.category } : {}),
    price: centsToEuros(source.unitPriceCents),
    quantity: source.quantity,
  };
}

export function buildEcommercePayload(
  sources: AnalyticsItemSource[],
  transactionId?: string,
): EcommercePayload {
  const valueCents = sources.reduce((sum, s) => sum + s.unitPriceCents * s.quantity, 0);
  return {
    currency: ECOMMERCE_CURRENCY,
    value: centsToEuros(valueCents),
    items: sources.map(toAnalyticsItem),
    ...(transactionId ? { transaction_id: transactionId } : {}),
  };
}
