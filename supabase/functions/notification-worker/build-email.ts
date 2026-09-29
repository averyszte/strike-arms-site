import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { loadEmailOrder, type EmailOrder } from "./load-order.ts";
import { loadEmailProduct } from "./load-product.ts";
import type { RenderedEmail } from "./templates/layout.ts";
import { lowStockEmail } from "./templates/low-stock.ts";
import { orderConfirmedEmail } from "./templates/order-confirmed.ts";
import { ownerOrderPaidEmail } from "./templates/owner-order-paid.ts";
import { refundedEmail } from "./templates/refunded.ts";
import { statusChangedEmail } from "./templates/status-changed.ts";

/** A claimed row of notification_jobs (030, 031). Exactly one id is set. */
export type NotificationJob = {
  id: string;
  event_type: string;
  order_id: string | null;
  product_id: string | null;
  recipient: string;
  payload: Record<string, unknown> | null;
  attempt_count: number;
};

export type JobEmail = RenderedEmail & { replyTo?: string };

function numberField(payload: NotificationJob["payload"], key: string): number {
  const value = payload?.[key];
  if (typeof value !== "number") throw new Error(`Job payload has no number ${key}`);
  return value;
}

function stringField(payload: NotificationJob["payload"], key: string): string {
  const value = payload?.[key];
  if (typeof value !== "string") throw new Error(`Job payload has no string ${key}`);
  return value;
}

function orderEmail(job: NotificationJob, order: EmailOrder, siteUrl: string): JobEmail {
  switch (job.event_type) {
    case "customer.order_confirmed":
      return orderConfirmedEmail(order);
    case "owner.order_paid":
      // Reply goes to the customer.
      return { ...ownerOrderPaidEmail(order, `${siteUrl}/admin/orders`), replyTo: order.customerEmail ?? undefined };
    case "customer.status_changed":
      return statusChangedEmail(order, stringField(job.payload, "status"));
    case "customer.refunded":
      return refundedEmail(order, numberField(job.payload, "refunded_now_cents"));
    default:
      throw new Error(`Unknown order notification type ${job.event_type}`);
  }
}

/**
 * Loads what the job is about and renders its email. An unknown event type
 * is a failed job, not a skip, so it shows up rather than vanishing.
 */
export async function renderJob(
  admin: SupabaseClient,
  job: NotificationJob,
  siteUrl: string,
): Promise<JobEmail> {
  if (job.event_type === "owner.low_stock" && job.product_id) {
    return lowStockEmail(await loadEmailProduct(admin, job.product_id), `${siteUrl}/admin/products`);
  }
  if (job.order_id) {
    return orderEmail(job, await loadEmailOrder(admin, job.order_id), siteUrl);
  }
  throw new Error(`Job ${job.id} (${job.event_type}) has nothing to send about`);
}
