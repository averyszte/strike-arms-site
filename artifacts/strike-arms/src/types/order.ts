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
  customerEmail: string;
  customerPhone: string | null;
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
