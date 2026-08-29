// Hand-written DB types — mirrors 001_schema.sql exactly.
// Regenerate with: supabase gen types typescript --local > src/types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'partially_refunded' | 'failed' | 'expired';
type FulfillmentStatus =
  | 'pending' | 'ready_for_pickup' | 'collected'
  | 'packed' | 'shipped' | 'delivered' | 'cancelled';
type FulfillmentMethod = 'pickup' | 'delivery' | 'mixed';
type ItemFulfillmentMethod = 'pickup' | 'delivery';
type InquiryStatus = 'new' | 'replied' | 'archived';
type NotificationStatus = 'pending' | 'sent' | 'failed';

// ─── Row types ────────────────────────────────────────────────────────────────

type ProductRow = {
  id: string; slug: string; name: string; category: string; subcategory: string; brand: string;
  price_cents: number; sale_price_cents: number | null;
  // Generated: coalesce(sale_price_cents, price_cents). Read-only — the shop
  // sorts on it because PostgREST cannot order by an expression.
  effective_price_cents: number;
  images: string[]; short_description: string; description: string;
  is_new: boolean; is_featured: boolean; is_published: boolean;
  stock_count: number; reserved_count: number; low_stock_threshold: number;
  in_stock: boolean; tags: string[];
  is_shippable: boolean; ship_weight_g: number;
  created_at: string; updated_at: string;
};

type OrderRow = {
  // Null until payment succeeds — numbers are assigned by confirm_order_paid so
  // that abandoned checkouts do not burn them.
  id: string; order_number: string | null;
  stripe_session_id: string | null; stripe_payment_intent: string | null;
  checkout_attempt_id: string | null;
  customer_name: string; customer_email: string; customer_phone: string | null;
  payment_status: PaymentStatus; fulfillment_status: FulfillmentStatus;
  fulfillment_method: FulfillmentMethod;
  total_cents: number; vat_cents: number; refund_cents: number; shipping_cents: number;
  shipping_name: string | null; shipping_line1: string | null; shipping_line2: string | null;
  shipping_city: string | null; shipping_county: string | null; shipping_eircode: string | null;
  age_verified: boolean; notes: string | null; is_archived: boolean;
  paid_at: string | null; refunded_at: string | null;
  created_at: string; updated_at: string;
};

type OrderItemRow = {
  id: string; order_id: string; product_id: string | null;
  product_slug: string; product_name: string; product_image: string | null; brand: string;
  unit_price_cents: number; quantity: number; subtotal_cents: number;
  fulfillment_method: ItemFulfillmentMethod;
};

type OrderStatusLogRow = {
  id: string; order_id: string; field: 'payment_status' | 'fulfillment_status';
  from_status: string | null; to_status: string;
  changed_by: string | null; note: string | null; created_at: string;
};

type InventoryAdjustmentRow = {
  id: string; product_id: string; adjustment: number;
  reason: string; adjusted_by: string | null; created_at: string;
};

type CheckoutReservationRow = {
  id: string; product_id: string; quantity: number; order_id: string | null;
  session_key: string; expires_at: string; created_at: string;
};

type InquiryRow = {
  id: string; name: string; email: string; phone: string | null;
  subject: string | null; message: string; status: InquiryStatus;
  consent: boolean; source_page: string | null; created_at: string;
};

type NotificationJobRow = {
  id: string; type: string; payload: Json;
  status: NotificationStatus; attempt_count: number;
  next_attempt_at: string; last_error: string | null; created_at: string;
};

type SubcategoryRow = {
  id: string; category: string; slug: string; name: string;
  sort_order: number; created_at: string;
};

// Bucket paths no longer referenced by any product, filed by a trigger on
// products and drained by the sweep-orphan-images Edge Function. No browser
// role holds a grant on it — it is here so the shape stays documented.
type OrphanedImageRow = {
  path: string;
  orphaned_at: string;
  attempt_count: number;
  last_error: string | null;
};

// Single row, id always 1. The rates the cart and the checkout function both
// read, so neither can quote a number the other does not have.
type StoreSettingsRow = {
  id: number;
  shipping_flat_cents: number;
  free_shipping_threshold_cents: number;
  vat_rate_basis_points: number;
  updated_at: string;
  updated_by: string | null;
};

// ─── Database shape ───────────────────────────────────────────────────────────
// Matches the shape expected by @supabase/supabase-js v2 generics.
// Each table needs a Relationships array; schema needs CompositeTypes.

export type Database = {
  public: {
    Tables: {
      products: {
        Row: ProductRow;
        Insert: Omit<
          ProductRow,
          'id' | 'in_stock' | 'effective_price_cents' | 'created_at' | 'updated_at' |
          'description' | 'is_published' | 'stock_count' | 'reserved_count' | 'low_stock_threshold' |
          'is_shippable' | 'ship_weight_g'
        > & {
          id?: string; created_at?: string; updated_at?: string;
          description?: string; is_published?: boolean;
          stock_count?: number; reserved_count?: number; low_stock_threshold?: number;
          is_shippable?: boolean; ship_weight_g?: number;
        };
        Update: Partial<Omit<ProductRow, 'in_stock' | 'effective_price_cents'>>;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: Omit<OrderRow, 'id' | 'order_number' | 'created_at' | 'updated_at'> & {
          id?: string; order_number?: string | null;
          created_at?: string; updated_at?: string;
        };
        Update: Partial<Omit<OrderRow, 'id' | 'order_number'>>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItemRow;
        Insert: Omit<OrderItemRow, 'id' | 'subtotal_cents'> & { id?: string };
        Update: Partial<Omit<OrderItemRow, 'id' | 'subtotal_cents'>>;
        Relationships: [];
      };
      order_status_log: {
        Row: OrderStatusLogRow;
        Insert: Omit<OrderStatusLogRow, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<OrderStatusLogRow, 'id'>>;
        Relationships: [];
      };
      inventory_adjustments: {
        Row: InventoryAdjustmentRow;
        Insert: Omit<InventoryAdjustmentRow, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<InventoryAdjustmentRow, 'id'>>;
        Relationships: [];
      };
      checkout_reservations: {
        Row: CheckoutReservationRow;
        Insert: Omit<CheckoutReservationRow, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<CheckoutReservationRow, 'id'>>;
        Relationships: [];
      };
      inquiries: {
        Row: InquiryRow;
        Insert: Omit<InquiryRow, 'id' | 'created_at' | 'status'> & {
          id?: string; status?: InquiryStatus;
        };
        Update: Partial<Omit<InquiryRow, 'id'>>;
        Relationships: [];
      };
      admins: {
        Row: { id: string };
        Insert: { id: string };
        Update: { id?: string };
        Relationships: [];
      };
      stripe_event_log: {
        Row: { id: string; type: string; processed_at: string };
        Insert: { id: string; type?: string; processed_at?: string };
        Update: { type?: string; processed_at?: string };
        Relationships: [];
      };
      notification_jobs: {
        Row: NotificationJobRow;
        Insert: Omit<NotificationJobRow, 'id' | 'created_at'> & {
          id?: string; status?: NotificationStatus;
          attempt_count?: number; next_attempt_at?: string;
        };
        Update: Partial<Omit<NotificationJobRow, 'id'>>;
        Relationships: [];
      };
      subcategories: {
        Row: SubcategoryRow;
        Insert: Omit<SubcategoryRow, 'id' | 'created_at'> & {
          id?: string; sort_order?: number;
        };
        Update: Partial<Omit<SubcategoryRow, 'id' | 'created_at'>>;
        Relationships: [];
      };
      store_settings: {
        Row: StoreSettingsRow;
        // No insert or delete is granted to any browser role: the row is
        // seeded by migration 010 and must never be absent.
        Insert: never;
        Update: Partial<Omit<StoreSettingsRow, 'id' | 'updated_at'>>;
        Relationships: [];
      };
      orphaned_images: {
        Row: OrphanedImageRow;
        Insert: Pick<OrphanedImageRow, 'path'> & Partial<OrphanedImageRow>;
        Update: Partial<OrphanedImageRow>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      is_admin_aal2: { Args: Record<PropertyKey, never>; Returns: boolean };
      adjust_stock: {
        Args: {
          p_product_id: string;
          p_adjustment: number;
          p_reason: string;
          p_adjusted_by?: string;
        };
        Returns: undefined;
      };
      reserve_stock: {
        Args: {
          p_product_id: string;
          p_quantity: number;
          p_session_key: string;
          p_expires_at: string;
        };
        Returns: boolean;
      };
      // Checkout and webhook functions. These are granted to service_role only
      // and are called from the Edge Functions, never from the browser, but
      // they belong in the schema type so the shape stays documented here.
      claim_stripe_event: {
        Args: { p_event_id: string; p_type: string };
        Returns: boolean;
      };
      release_stripe_event: {
        Args: { p_event_id: string };
        Returns: undefined;
      };
      reserve_order_stock: {
        Args: { p_order_id: string; p_lines: Json; p_expires_at: string };
        Returns: string | null;
      };
      release_order_reservations: {
        Args: { p_order_id: string };
        Returns: undefined;
      };
      clear_stale_checkout_attempt: {
        Args: { p_attempt_id: string };
        Returns: number;
      };
      confirm_order_paid: {
        Args: {
          p_order_id: string;
          p_payment_intent_id: string | null;
          p_session_id?: string | null;
        };
        Returns: string | null;
      };
      expire_order: {
        Args: { p_order_id: string };
        Returns: boolean;
      };
      record_refund: {
        Args: {
          p_payment_intent_id: string;
          p_refund_cents: number;
          p_fully_refunded: boolean;
        };
        Returns: boolean;
      };
      release_expired_reservations: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      bump_orphan_attempts: {
        Args: { p_paths: string[]; p_error: string };
        Returns: undefined;
      };
      storage_path_from_public_url: {
        Args: { p_url: string };
        Returns: string | null;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
