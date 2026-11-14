import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { loadEmailInquiry } from "./load-inquiry.ts";
import { loadEmailOrder, type EmailOrder } from "./load-order.ts";
import { healthDigestEmail, parseHealthDigest } from "./templates/health-digest.ts";
import type { RenderedEmail } from "./templates/layout.ts";
import { orderConfirmedEmail } from "./templates/order-confirmed.ts";
import { ownerNewInquiryEmail } from "./templates/owner-new-inquiry.ts";
import { ownerOrderPaidEmail } from "./templates/owner-order-paid.ts";
import { refundedEmail } from "./templates/refunded.ts";
import { STATUS_EMAIL_STATUSES, statusChangedEmail } from "./templates/status-changed.ts";

/**
 * A claimed row of notification_jobs (030, 031, 039, 042). At most one id is
 * set; owner.health_digest has none.
 */
export type NotificationJob = {
  id: string;
  event_type: string;
  order_id: string | null;
  product_id: string | null;
  inquiry_id: string | null;
  recipient: string;
  payload: Record<string, unknown> | null;
  attempt_count: number;
};

export type JobEmail = RenderedEmail & { replyTo?: string };

/** What to do with a job: send this email, or send nothing and say why. */
export type RenderedJob =
  | { kind: "send"; email: JobEmail }
  | { kind: "skip"; reason: string };

/**
 * The job itself is wrong (unknown type, missing payload field, nothing to
 * send about). Trying again cannot help, so the worker fails it at once
 * rather than retrying it eight times.
 */
export class PermanentJobError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermanentJobError";
  }
}

const HEALTH_DIGEST = "owner.health_digest";

function numberField(payload: NotificationJob["payload"], key: string): number {
  const value = payload?.[key];
  if (typeof value !== "number") throw new PermanentJobError(`Job payload has no number ${key}`);
  return value;
}

function stringField(payload: NotificationJob["payload"], key: string): string {
  const value = payload?.[key];
  if (typeof value !== "string") throw new PermanentJobError(`Job payload has no string ${key}`);
  return value;
}

function send(email: JobEmail): RenderedJob {
  return { kind: "send", email };
}

/**
 * A status email is only true while the order is still in that status. The
 * 042 trigger withdraws a waiting job when the order moves on, but not one
 * already tried, and not an admin re-send (resend_notification, 031) of an
 * old status. Either way, telling the customer "packed" about an order that
 * is now cancelled would be wrong, so it is skipped.
 */
function statusEmail(job: NotificationJob, order: EmailOrder, siteUrl: string): RenderedJob {
  const status = stringField(job.payload, "status");
  if (!STATUS_EMAIL_STATUSES.has(status)) throw new PermanentJobError(`No status email for ${status}`);
  if (order.fulfillmentStatus !== status) {
    return {
      kind: "skip",
      reason: `Not sent: order ${order.orderNumber} moved from ${status} to ${order.fulfillmentStatus} before it went out`,
    };
  }
  return send(statusChangedEmail(order, status, siteUrl));
}

function orderEmail(job: NotificationJob, order: EmailOrder, siteUrl: string): RenderedJob {
  switch (job.event_type) {
    case "customer.order_confirmed":
      return send(orderConfirmedEmail(order, siteUrl));
    case "owner.order_paid":
      // Reply goes to the customer.
      return send({
        ...ownerOrderPaidEmail(order, `${siteUrl}/admin/orders`),
        replyTo: order.customerEmail ?? undefined,
      });
    case "customer.status_changed":
      return statusEmail(job, order, siteUrl);
    case "customer.refunded":
      return send(refundedEmail(order, numberField(job.payload, "refunded_now_cents")));
    default:
      throw new PermanentJobError(`Unknown order notification type ${job.event_type}`);
  }
}

function digestEmail(job: NotificationJob, siteUrl: string): RenderedJob {
  const digest = parseHealthDigest(job.payload);
  if (!digest) return { kind: "skip", reason: "Not sent: the health digest had no checks to report" };
  return send(healthDigestEmail(digest, `${siteUrl}/admin`));
}

/**
 * Loads what the job is about and renders its email. An unknown event type
 * is a failed job, not a skip, so it shows up rather than vanishing. A
 * database error while loading is thrown as it is, so the job is retried.
 */
export async function renderJob(
  admin: SupabaseClient,
  job: NotificationJob,
  siteUrl: string,
): Promise<RenderedJob> {
  if (job.event_type === HEALTH_DIGEST) {
    return digestEmail(job, siteUrl);
  }
  if (job.order_id) {
    return orderEmail(job, await loadEmailOrder(admin, job.order_id), siteUrl);
  }
  if (job.inquiry_id && job.event_type === "owner.new_inquiry") {
    const inquiry = await loadEmailInquiry(admin, job.inquiry_id);
    // Reply goes to whoever sent the form.
    return send({ ...ownerNewInquiryEmail(inquiry, `${siteUrl}/admin/inquiries`), replyTo: inquiry.email });
  }
  throw new PermanentJobError(`Job ${job.id} (${job.event_type}) has nothing to send about`);
}
