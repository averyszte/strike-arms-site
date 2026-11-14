/**
 * Admin-only tables and RPCs from the pre-launch audit migrations 041 to 048,
 * intersected into Database in database.ts. Kept apart so that file stays
 * under the size limit. Every RPC here checks is_admin_aal2().
 */

export type HealthStatus = 'ok' | 'warn' | 'fail';

export type OrderRefundRow = {
  id: string;
  order_id: string;
  amount_cents: number;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  source: 'stripe' | 'manual' | 'void';
  note: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type StoreSettingsHistoryRow = {
  id: number;
  changed_at: string;
  changed_by: string | null;
  old_shipping_flat_cents: number;
  new_shipping_flat_cents: number;
  old_free_shipping_threshold_cents: number;
  new_free_shipping_threshold_cents: number;
  old_vat_rate_basis_points: number;
  new_vat_rate_basis_points: number;
};

export type NotificationEnqueueErrorRow = {
  id: string;
  source: string;
  event_type: string | null;
  order_id: string | null;
  inquiry_id: string | null;
  detail: string;
  created_at: string;
  resolved_at: string | null;
};

export type AdminTables = {
  /** 041: one row per refund. Admin AAL2 select only. */
  order_refunds: {
    Row: OrderRefundRow;
    Insert: never;
    Update: never;
    Relationships: [];
  };
  /** 043: written by a trigger on store_settings. Admin AAL2 select only. */
  store_settings_history: {
    Row: StoreSettingsHistoryRow;
    Insert: never;
    Update: never;
    Relationships: [];
  };
  /** 042: jobs that could not be queued. An admin may only set resolved_at. */
  notification_enqueue_errors: {
    Row: NotificationEnqueueErrorRow;
    Insert: never;
    Update: Pick<NotificationEnqueueErrorRow, 'resolved_at'>;
    Relationships: [];
  };
};

export type AdminFunctions = {
  /** 048: thirteen read-only checks for the dashboard card. */
  system_health: {
    Args: Record<PropertyKey, never>;
    Returns: { check_name: string; status: HealthStatus; detail: string }[];
  };
  /** 041: cash or goodwill refund. Raises when it exceeds what is left. */
  record_manual_refund: {
    Args: { p_order_id: string; p_amount_cents: number; p_note: string };
    Returns: { order_id: string; refund_cents: number; payment_status: string };
  };
  /** 041: counter sales only, on the day they were made (Irish time). */
  void_counter_order: {
    Args: { p_order_id: string; p_reason: string };
    Returns: { order_id: string; order_number: string | null; refunded_cents: number; cancelled: boolean };
  };
  /** 046: how many customers a bulk status change would email. */
  preview_status_emails: {
    Args: { p_order_ids: string[]; p_status: string };
    Returns: number;
  };
  /** 045: the photo deletion queue, newest first. */
  list_orphaned_images: {
    Args: Record<PropertyKey, never>;
    Returns: {
      path: string;
      orphaned_at: string;
      sweep_after: string;
      attempt_count: number;
      last_error: string | null;
    }[];
  };
  /** 045: takes a photo off the queue. False when it was not queued. */
  restore_orphaned_image: {
    Args: { p_path: string };
    Returns: boolean;
  };
};
