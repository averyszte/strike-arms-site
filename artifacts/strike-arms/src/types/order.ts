export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'refunded'
  | 'partially_refunded'
  | 'failed'
  | 'expired';

export type FulfillmentStatus =
  | 'pending'
  | 'ready_for_pickup'
  | 'collected'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

/** How an order is handed over. 'mixed' is a collection and a parcel. */
export type FulfillmentMethod = 'pickup' | 'delivery' | 'mixed';

/** How a single line is handed over. A line is never itself mixed. */
export type ItemFulfillmentMethod = 'pickup' | 'delivery';

/**
 * Where the sale came from. Without this, D2 cannot tell what the website
 * earned from what the shop earned — it would report one blended figure.
 */
export type OrderChannel = 'web' | 'counter' | 'phone';

/** How Alan was actually paid, for reconciling against the till. */
export type PaymentMethod = 'stripe' | 'cash' | 'card_terminal' | 'bank_transfer';

export type ShippingAddress = {
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  county: string | null;
  eircode: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string | null;
  productSlug: string;
  productName: string;
  productImage: string | null;
  brand: string;
  unitPriceCents: number;
  quantity: number;
  subtotalCents: number;
  fulfillmentMethod: ItemFulfillmentMethod;
};

export type Order = {
  id: string;
  // Null until payment succeeds — numbers are assigned on payment so that
  // abandoned checkouts do not burn them.
  orderNumber: string | null;
  stripeSessionId: string | null;
  stripePaymentIntent: string | null;
  customerName: string;
  // Null for a walk-in who gave no address. A delivery order always has one:
  // the database refuses anything else.
  customerEmail: string | null;
  customerPhone: string | null;
  channel: OrderChannel;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  fulfillmentMethod: FulfillmentMethod;
  totalCents: number;
  vatCents: number;
  refundCents: number;
  shippingCents: number;
  shippingAddress: ShippingAddress | null;
  paidAt: string | null;
  refundedAt: string | null;
  ageVerified: boolean;
  notes: string | null;
  isArchived: boolean;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type OrderStatusLogEntry = {
  id: string;
  orderId: string;
  field: 'payment_status' | 'fulfillment_status';
  fromStatus: string | null;
  toStatus: string;
  changedBy: string | null;
  note: string | null;
  createdAt: string;
};

export type OrderListFilters = {
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  search?: string;
  isArchived?: boolean;
  page?: number;
  pageSize?: number;
};

/**
 * One line of an order being rung up at the counter.
 *
 * Prices are absent on purpose. The admin chooses what and how many; every
 * amount is computed server-side by create_counter_order from the catalogue,
 * so a counter sale and a web sale of the same basket produce identical
 * numbers. The UI's totals are a preview of that, never an input to it.
 */
export type CounterOrderLine = {
  productId: string;
  quantity: number;
  fulfillmentMethod: ItemFulfillmentMethod;
};

/**
 * The counter form's own state. Every field is a string because that is what
 * an input holds; draftToCounterOrderInput() turns it into the nullable shape
 * the database wants.
 */
export type CounterOrderDraft = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  channel: OrderChannel;
  notes: string;
  ageVerified: boolean;
  shippingLine1: string;
  shippingLine2: string;
  shippingCity: string;
  shippingCounty: string;
  shippingEircode: string;
};

export type CounterOrderInput = {
  lines: CounterOrderLine[];
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  paymentMethod: PaymentMethod;
  channel: OrderChannel;
  notes: string | null;
  ageVerified: boolean;
  shippingLine1: string | null;
  shippingLine2: string | null;
  shippingCity: string | null;
  shippingCounty: string | null;
  shippingEircode: string | null;
};

export type CounterOrderResult = {
  orderId: string;
  orderNumber: string | null;
};
