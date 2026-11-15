import { format } from 'date-fns';

import type { FulfillmentStatus, Order } from '@/types/order';

/**
 * The age check, said as what it actually is (N-084).
 *
 * age_verified on a web order is the customer's own tick at checkout, not a
 * check anyone made, so it is never printed as "Age verified". On a counter
 * sale it is staff saying they checked in person. Photo ID seen at collection
 * is recorded separately (migration 050).
 */

type AgeCheckOrder = Pick<
  Order,
  'channel' | 'fulfillmentMethod' | 'ageVerified' | 'idCheckedAt'
>;

/** A web order with something to collect, whose photo ID has not been recorded yet. */
export function needsIdCheck(order: AgeCheckOrder, to: FulfillmentStatus): boolean {
  return (
    to === 'collected' &&
    order.fulfillmentMethod !== 'delivery' &&
    order.channel !== 'counter' &&
    order.idCheckedAt === null
  );
}

/** The lines the packing slip and the order sheet print about age, in order. */
export function ageCheckLines(order: AgeCheckOrder): string[] {
  const lines: string[] = [];
  if (order.ageVerified) {
    lines.push(order.channel === 'counter' ? 'Age checked in person' : '18+ declared online');
  }
  if (order.idCheckedAt) {
    lines.push(`Photo ID checked at collection, ${format(new Date(order.idCheckedAt), 'd MMM yyyy HH:mm')}`);
  } else if (order.fulfillmentMethod !== 'delivery' && order.channel !== 'counter') {
    lines.push('Check photo ID on collection');
  }
  return lines;
}
