import type { EmailOrder } from "../load-order.ts";
import { button, layout, panel, paragraph, SHOP, type RenderedEmail } from "./layout.ts";
import {
  COLLECTION_LINES,
  hasCollection,
  hasPosting,
  itemsTable,
  itemsText,
  postingAddress,
  progressSteps,
  trackOrderUrl,
} from "./order-blocks.ts";

function nextSteps(order: EmailOrder): string[] {
  const next: string[] = [];
  if (hasCollection(order)) next.push("We will email you when your collect-in-store items are ready to pick up.");
  if (hasPosting(order)) next.push("We will email you when your posted items are on their way.");
  // Flagged when it was paid (029). The reason is for the shop, not the
  // customer; this only says someone will be in touch.
  if (order.needsAttention) {
    next.push(`One of your items needs checking. We will contact you shortly, or call us on ${SHOP.phone}.`);
  }
  return next;
}

// A mixed order walks two lanes, so it gets no single progress bar.
function startingSteps(order: EmailOrder): string {
  if (order.fulfillmentMethod === "mixed") return "";
  return progressSteps(order.fulfillmentMethod === "delivery" ? "paid_post" : "paid_collect");
}

/** To the customer, once the payment is confirmed. */
export function orderConfirmedEmail(order: EmailOrder, siteUrl: string): RenderedEmail {
  const intro = `Thanks, ${order.customerName}. We have your payment and your order is in.`;
  const next = nextSteps(order);
  const address = postingAddress(order);
  const trackUrl = trackOrderUrl(order, siteUrl);

  const html = layout({
    preheader: `Order ${order.orderNumber}: ${next[0] ?? "thanks for your order."}`,
    eyebrow: `Order ${order.orderNumber}`,
    heading: "Your order is confirmed",
    body:
      paragraph(intro) +
      startingSteps(order) +
      itemsTable(order) +
      (address.length > 0 ? panel("Posting to", address) : "") +
      (hasCollection(order) ? panel("Collecting from the shop", COLLECTION_LINES) : "") +
      panel("What happens next", next) +
      button("Track your order", trackUrl),
  });

  return {
    subject: `Order ${order.orderNumber} confirmed`,
    html,
    text: [
      intro,
      `Order number: ${order.orderNumber}`,
      itemsText(order),
      address.length > 0 ? `Posting to:\n${address.join("\n")}` : "",
      hasCollection(order) ? `Collecting from the shop:\n${COLLECTION_LINES.join("\n")}` : "",
      ...next,
      `Track your order: ${trackUrl}`,
      `${SHOP.name}, ${SHOP.phone}`,
    ].filter(Boolean).join("\n\n"),
  };
}
