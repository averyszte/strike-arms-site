import type { Json } from '@/types/database-rows';

/**
 * Split out of database.ts when it reached the file limit. These are
 * intersected into Database['public']['Functions'] there.
 */
export type ServerFunctions = {
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
  // 028: abandons the attempt's pending orders and returns their Stripe
  // sessions, which create-checkout-session then expires.
  clear_stale_checkout_attempt: {
    Args: { p_attempt_id: string };
    Returns: string[];
  };
  abandon_order: {
    Args: { p_order_id: string };
    Returns: boolean;
  };
  order_stock_shortfall: {
    Args: { p_order_id: string };
    Returns: string | null;
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
  // 029: append a reason to orders.attention_reason, and close the payment
  // alerts for a payment intent once it is refunded.
  flag_order: {
    Args: { p_order_id: string; p_reason: string };
    Returns: undefined;
  };
  resolve_payment_alert: {
    Args: { p_payment_intent_id: string };
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
    // The number of holds released, so a cron run reads as more than
    // "it ran" in cron.job_run_details.
    Returns: number;
  };
};
