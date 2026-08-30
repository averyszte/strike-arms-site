import type { Order, OrderItem } from '@/types/order';

/** The two things Alan prints: one goes in the box, one goes to the customer. */
export type OrderDocumentKind = 'packing-slip' | 'invoice';

export const ORDER_DOCUMENT_LABELS: Record<OrderDocumentKind, string> = {
  'packing-slip': 'Packing slip',
  invoice: 'Invoice',
};

/**
 * A printed document is a legal-ish artefact, so an unrecognised value must not
 * silently become an invoice. Anything that is not the invoice is the packing
 * slip, which carries no prices and so cannot mislead anyone if it is wrong.
 */
export function readDocumentKind(search: string): OrderDocumentKind {
  return new URLSearchParams(search).get('doc') === 'invoice' ? 'invoice' : 'packing-slip';
}

export type ItemGroup = {
  heading: string;
  items: OrderItem[];
};

/**
 * Splits the lines into what is physically going in the parcel and what the
 * customer is coming in to collect.
 *
 * An order can be both, and a picker working from an undifferentiated list will
 * post something that was meant to stay behind the counter. The headings only
 * appear when there is genuinely a distinction to draw.
 */
export function groupItemsForPicking(order: Order): ItemGroup[] {
  const items = order.items ?? [];
  const posted = items.filter((item) => item.fulfillmentMethod === 'delivery');
  const collected = items.filter((item) => item.fulfillmentMethod === 'pickup');

  if (posted.length === 0 || collected.length === 0) {
    return items.length === 0 ? [] : [{ heading: '', items }];
  }

  return [
    { heading: 'In this parcel', items: posted },
    { heading: 'Held for collection — do not post', items: collected },
  ];
}

/** Total units, so the packer can count the box against one number. */
export function countUnits(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
