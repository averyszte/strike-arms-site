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
  | 'cancelled';

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
};

export type Order = {
  id: string;
  orderNumber: string;
  stripeSessionId: string | null;
  stripePaymentIntent: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  totalCents: number;
  vatCents: number;
  refundCents: number;
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
