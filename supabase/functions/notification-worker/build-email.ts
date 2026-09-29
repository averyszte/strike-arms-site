import type { EmailOrder } from "./load-order.ts";
import type { RenderedEmail } from "./templates/layout.ts";
import { orderConfirmedEmail } from "./templates/order-confirmed.ts";
import { ownerOrderPaidEmail } from "./templates/owner-order-paid.ts";
import { refundedEmail } from "./templates/refunded.ts";
import { statusChangedEmail } from "./templates/status-changed.ts";

/** A claimed row of notification_jobs (030). */
export type NotificationJob = {
  id: string;
  event_type: string;
  order_id: string;
  recipient: string;
  payload: Record<string, unknown> | null;
  attempt_count: number;
};

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

/** Picks the template for a job. An unknown event type is a failed job, not a skip. */
export function buildEmail(job: NotificationJob, order: EmailOrder, siteUrl: string): RenderedEmail {
  switch (job.event_type) {
    case "customer.order_confirmed":
      return orderConfirmedEmail(order);
    case "owner.order_paid":
      return ownerOrderPaidEmail(order, `${siteUrl}/admin/orders`);
    case "customer.status_changed":
      return statusChangedEmail(order, stringField(job.payload, "status"));
    case "customer.refunded":
      return refundedEmail(order, numberField(job.payload, "refunded_now_cents"));
    default:
      throw new Error(`Unknown notification type ${job.event_type}`);
  }
}
