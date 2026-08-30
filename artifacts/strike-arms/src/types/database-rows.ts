// Row types for the Strike Arms schema — one per table, mirroring the
// migrations in supabase/migrations/.
//
// Split out of database.ts, which holds the Database shape that indexes them.
// The two are edited together: a column added here is a column PostgREST will
// return, and the Row/Insert/Update triple over there is what typechecks it.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'partially_refunded' | 'failed' | 'expired';
export type FulfillmentStatus =
  | 'pending' | 'ready_for_pickup' | 'collected'
  | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export type FulfillmentMethod = 'pickup' | 'delivery' | 'mixed';
export type ItemFulfillmentMethod = 'pickup' | 'delivery';
export type InquiryStatus = 'new' | 'replied' | 'archived';
export type OrderChannel = 'web' | 'counter' | 'phone';
export type PaymentMethod = 'stripe' | 'cash' | 'card_terminal' | 'bank_transfer';
export type NotificationStatus = 'pending' | 'sent' | 'failed';
// ─── Rows ─────────────────────────────────────────────────────────────────────

export type ProductRow = {
  id: string; slug: string; name: string; category: string; subcategory: string; brand: string;
  price_cents: number; sale_price_cents: number | null;
  // Generated: coalesce(sale_price_cents, price_cents). Read-only — the shop
  // sorts on it because PostgREST cannot order by an expression.
  effective_price_cents: number;
  images: string[]; short_description: string; description: string;
  is_new: boolean; is_featured: boolean; is_published: boolean;
  stock_count: number; reserved_count: number; low_stock_threshold: number;
  in_stock: boolean; tags: string[];
  // Generated: name, brand, short description and tags, lowercased and
  // joined. Read-only -- the storefront search filters on it (migration 015).
  search_text: string;
  is_shippable: boolean; ship_weight_g: number;
  created_at: string; updated_at: string;
};

export type OrderRow = {
  // Null until payment succeeds — numbers are assigned by confirm_order_paid so
  // that abandoned checkouts do not burn them.
  id: string; order_number: string | null;
  stripe_session_id: string | null; stripe_payment_intent: string | null;
  checkout_attempt_id: string | null;
  // Nullable since migration 013: a cash walk-in who gives no email is a real
  // sale. A check constraint still requires it on anything being delivered.
  customer_name: string; customer_email: string | null; customer_phone: string | null;
  channel: OrderChannel; payment_method: PaymentMethod;
  payment_status: PaymentStatus; fulfillment_status: FulfillmentStatus;
  fulfillment_method: FulfillmentMethod;
  total_cents: number; vat_cents: number; refund_cents: number; shipping_cents: number;
  shipping_name: string | null; shipping_line1: string | null; shipping_line2: string | null;
  shipping_city: string | null; shipping_county: string | null; shipping_eircode: string | null;
  age_verified: boolean; notes: string | null; is_archived: boolean;
  paid_at: string | null; refunded_at: string | null;
  created_at: string; updated_at: string;
};

export type OrderItemRow = {
  id: string; order_id: string; product_id: string | null;
  product_slug: string; product_name: string; product_image: string | null; brand: string;
  unit_price_cents: number; quantity: number; subtotal_cents: number;
  fulfillment_method: ItemFulfillmentMethod;
};

export type OrderStatusLogRow = {
  id: string; order_id: string; field: 'payment_status' | 'fulfillment_status';
  from_status: string | null; to_status: string;
  changed_by: string | null; note: string | null; created_at: string;
};

export type InventoryAdjustmentRow = {
  id: string; product_id: string; adjustment: number;
  reason: string; adjusted_by: string | null; created_at: string;
};

export type CheckoutReservationRow = {
  id: string; product_id: string; quantity: number; order_id: string | null;
  session_key: string; expires_at: string; created_at: string;
};

export type InquiryRow = {
  id: string; name: string; email: string; phone: string | null;
  subject: string | null; message: string; status: InquiryStatus;
  consent: boolean; source_page: string | null; created_at: string;
};

export type NotificationJobRow = {
  id: string; type: string; payload: Json;
  status: NotificationStatus; attempt_count: number;
  next_attempt_at: string; last_error: string | null; created_at: string;
};

export type SubcategoryRow = {
  id: string; category: string; slug: string; name: string;
  sort_order: number; created_at: string;
};

// Bucket paths no longer referenced by any product, filed by a trigger on
// products and drained by the sweep-orphan-images Edge Function. No browser
// role holds a grant on it — it is here so the shape stays documented.
export type OrphanedImageRow = {
  path: string;
  orphaned_at: string;
  attempt_count: number;
  last_error: string | null;
};

// Single row, id always 1. The rates the cart and the checkout function both
// read, so neither can quote a number the other does not have.
export type StoreSettingsRow = {
  id: number;
  shipping_flat_cents: number;
  free_shipping_threshold_cents: number;
  vat_rate_basis_points: number;
  updated_at: string;
  updated_by: string | null;
};
