// Hand-written DB types — the schema shape @supabase/supabase-js is generic
// over. The row types it indexes live in database-rows.ts.
//
// Regenerate with: supabase gen types typescript --local > src/types/database.ts

import type {
  CheckoutReservationRow,
  InquiryRow,
  InquiryStatus,
  InventoryAdjustmentRow,
  Json,
  NotificationJobRow,
  NotificationStatus,
  OrderChannel,
  OrderItemRow,
  OrderRow,
  OrderStatusLogRow,
  OrphanedImageRow,
  PaymentAlertRow,
  PaymentMethod,
  ProductCondition,
  ProductRow,
  StoreSettingsRow,
  SubcategoryRow,
} from '@/types/database-rows';
import type { ServerFunctions } from '@/types/database-server-functions';

export type { Json } from '@/types/database-rows';

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
          'id' | 'in_stock' | 'effective_price_cents' | 'search_text' | 'sellable_count' |
          'is_archived' | 'archived_at' | 'created_at' | 'updated_at' |
          'description' | 'is_published' | 'stock_count' | 'reserved_count' | 'low_stock_threshold' |
          'is_shippable' | 'ship_weight_g' | 'condition'
        > & {
          id?: string; created_at?: string; updated_at?: string;
          description?: string; is_published?: boolean;
          // Defaults to 'new' in the database (018), so an insert may leave it
          // out -- but anything secondhand has to say so.
          condition?: ProductCondition;
          stock_count?: number; reserved_count?: number; low_stock_threshold?: number;
          is_shippable?: boolean; ship_weight_g?: number;
          is_archived?: boolean; archived_at?: string | null;
        };
        Update: Partial<
          Omit<ProductRow, 'in_stock' | 'effective_price_cents' | 'search_text' | 'sellable_count'>
        >;
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
      // 029. Rows are written by the webhook; an admin can only resolve one.
      payment_alerts: {
        Row: PaymentAlertRow;
        Insert: never;
        Update: Pick<PaymentAlertRow, 'resolved_at'>;
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
    Functions: ServerFunctions & {
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      is_admin_aal2: { Args: Record<PropertyKey, never>; Returns: boolean };
      adjust_stock: {
        Args: {
          p_product_id: string;
          p_adjustment: number;
          p_reason: string;
        };
        Returns: undefined;
      };
      // Deployment metadata (migration 016). Admin-only; the Settings screen
      // compares the result against the migrations in the repo.
      applied_migrations: {
        Args: Record<PropertyKey, never>;
        Returns: { version: string }[];
      };
      // Storefront search (migration 015). Ranked in the database so the
      // dropdown does not have to hold the catalogue to sort it.
      search_products: {
        Args: { p_query: string; p_limit?: number };
        Returns: ProductRow[];
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
      // Counter and phone sales (migration 013). The only route to creating an
      // order from the browser: there are deliberately no INSERT policies on
      // orders or order_items, so nothing the client sends can decide money.
      create_counter_order: {
        Args: {
          p_lines: Json;
          p_customer_name: string;
          p_customer_email?: string | null;
          p_customer_phone?: string | null;
          p_payment_method?: PaymentMethod;
          p_channel?: OrderChannel;
          p_notes?: string | null;
          p_age_verified?: boolean;
          p_shipping_line1?: string | null;
          p_shipping_line2?: string | null;
          p_shipping_city?: string | null;
          p_shipping_county?: string | null;
          p_shipping_eircode?: string | null;
        };
        Returns: { order_id: string; order_number: string | null };
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
