import type { EmailOrder } from "../load-order.ts";
import { button, layout, panel, paragraph, SHOP, textLink, type RenderedEmail } from "./layout.ts";
import { COLLECTION_LINES, progressSteps, trackOrderUrl } from "./order-blocks.ts";

/**
 * To the customer on every forward step of their order (033 decides which
 * changes queue one). A mixed order walks both lanes, so its wording names
 * which part of the order the step is about.
 */

type StatusCopy = {
  heading: string;
  /** The verb for one order, and for the items of one lane of a mixed one. */
  one: string;
  many: string;
  extra?: string;
  /** Mixed-order wording for the part of the order this step is about. */
  part: "posted" | "collect";
};

const AN_POST_TRACKING = "https://www.anpost.com/Post-Parcels/Track/History?item=";

const STATUS_COPY: Record<string, StatusCopy> = {
  packed: {
    heading: "We are packing your order",
    one: "is being packed",
    many: "are being packed",
    extra: "We will email you again when it is in the post.",
    part: "posted",
  },
  shipped: {
    heading: "Your order is on its way",
    one: "is on its way",
    many: "are on their way",
    extra: "Delivery within Ireland usually takes one to three working days.",
    part: "posted",
  },
  delivered: {
    heading: "Your order has been delivered",
    one: "has been delivered",
    many: "have been delivered",
    extra: "If anything is missing or not right, get in touch and we will sort it out.",
    part: "posted",
  },
  ready_for_pickup: {
    heading: "Ready to collect",
    one: "is ready to collect",
    many: "are ready to collect",
    part: "collect",
  },
  collected: {
    heading: "Collected. Thanks for shopping with us",
    one: "has been collected",
    many: "have been collected",
    part: "collect",
  },
  cancelled: {
    heading: "Your order has been cancelled",
    one: "has been cancelled",
    many: "have been cancelled",
    extra: "If a refund is due, we will email you when it has been issued.",
    part: "posted",
  },
};

// "Order SA-1 is being packed" / "The posted items from order SA-1 are being packed".
function whatMoved(order: EmailOrder, status: string, copy: StatusCopy): string {
  if (order.fulfillmentMethod !== "mixed" || status === "cancelled") {
    return `Order ${order.orderNumber} ${copy.one}.`;
  }
  const part = copy.part === "posted" ? "posted items" : "collect-in-store items";
  return `The ${part} from order ${order.orderNumber} ${copy.many}.`;
}

/** The An Post link, only once the parcel is in the post and has a number. */
function postTrackingUrl(order: EmailOrder, status: string): string | null {
  if (!order.trackingNumber || (status !== "shipped" && status !== "delivered")) return null;
  return AN_POST_TRACKING + encodeURIComponent(order.trackingNumber);
}

export function statusChangedEmail(order: EmailOrder, status: string, siteUrl: string): RenderedEmail {
  const copy = STATUS_COPY[status];
  if (!copy) throw new Error(`No status email for ${status}`);

  const intro = `Hi ${order.customerName}. ${whatMoved(order, status, copy)}`;
  const questions = `Questions? Call us on ${SHOP.phone} or reply to this email.`;
  const trackUrl = trackOrderUrl(order, siteUrl);
  const postUrl = postTrackingUrl(order, status);
  const isCollecting = status === "ready_for_pickup";

  const html = layout({
    preheader: `Order ${order.orderNumber} ${copy.one}.`,
    eyebrow: `Order ${order.orderNumber}`,
    heading: copy.heading,
    body:
      paragraph(intro) +
      progressSteps(status) +
      (copy.extra ? paragraph(copy.extra) : "") +
      (isCollecting ? panel("Where and when", COLLECTION_LINES) : "") +
      (postUrl ? button(`Track with An Post`, postUrl) : "") +
      (postUrl ? textLink("See your order", trackUrl) : button("See your order", trackUrl)) +
      paragraph(questions),
  });

  return {
    subject: `Order ${order.orderNumber} ${copy.one}`,
    html,
    text: [
      intro,
      copy.extra ?? "",
      isCollecting ? `Where and when:\n${COLLECTION_LINES.join("\n")}` : "",
      postUrl ? `Track with An Post (${order.trackingNumber}): ${postUrl}` : "",
      `See your order: ${trackUrl}`,
      questions,
    ].filter(Boolean).join("\n\n"),
  };
}
