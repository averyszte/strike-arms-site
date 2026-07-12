// Hand-written DB types — mirrors 001_schema.sql exactly.
// Regenerate with: supabase gen types typescript --local > src/types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'partially_refunded' | 'failed' | 'expired';
type FulfillmentStatus = 'pending' | 'ready_for_pickup' | 'collected' | 'cancelled';
type InquiryStatus = 'new' | 'replied' | 'archived';
type NotificationStatus = 'pending' | 'sent' | 'failed';

// ─── Row types ────────────────────────────────────────────────────────────────

type ProductRow = {
  id: string; slug: string; name: string; category: string; subcategory: string; brand: string;
  price_cents: number; sale_price_cents: number | null;
  images: string[]; short_description: string; description: string;
  is_new: boolean; is_featured: boolean; is_published: boolean;
  stock_count: number; reserved_count: number; low_stock_threshold: number;
  in_stock: boolean; tags: string[];
  created_at: string; updated_at: string;
};

type OrderRow = {
  id: string; order_number: string;
  stripe_session_id: string | null; stripe_payment_intent: string | null;
  customer_name: string; customer_email: string; customer_phone: string | null;
  payment_status: PaymentStatus; fulfillment_status: FulfillmentStatus;
  total_cents: number; vat_cents: number; refund_cents: number;
  age_verified: boolean; notes: string | null; is_archived: boolean;
  created_at: string; updated_at: string;
};

type OrderItemRow = {
  id: string; order_id: string; product_id: string | null;
  product_slug: string; product_name: string; product_image: string | null; brand: string;
  unit_price_cents: number; quantity: number; subtotal_cents: number;
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
  id: string; product_id: string; quantity: number;
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
          'id' | 'in_stock' | 'created_at' | 'updated_at' |
          'description' | 'is_published' | 'stock_count' | 'reserved_count' | 'low_stock_threshold'
        > & {
          id?: string; created_at?: string; updated_at?: string;
          description?: string; is_published?: boolean;
          stock_count?: number; reserved_count?: number; low_stock_threshold?: number;
        };
        Update: Partial<Omit<ProductRow, 'in_stock'>>;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: Omit<OrderRow, 'id' | 'order_number' | 'created_at' | 'updated_at'> & {
          id?: string; order_number?: string; created_at?: string; updated_at?: string;
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
        Row: { id: string; processed_at: string };
        Insert: { id: string; processed_at?: string };
        Update: { processed_at?: string };
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
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
