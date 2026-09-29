import type { EmailOrder } from "../load-order.ts";
import {
  addressHtml,
  COLLECTION_NOTE,
  hasCollection,
  hasPosting,
  itemsTable,
  itemsText,
  layout,
  paragraph,
  SHOP,
  type RenderedEmail,
} from "./layout.ts";

/** To the customer, once the payment is confirmed. */
export function orderConfirmedEmail(order: EmailOrder): RenderedEmail {
  const intro = `Thanks, ${order.customerName}. We have your payment and your order number is ${order.orderNumber}.`;
  const next: string[] = [];
  if (hasCollection(order)) {
    next.push("We will email you when the collect-in-store items are ready to pick up.");
    next.push(COLLECTION_NOTE);
  }
  if (hasPosting(order)) next.push("We will email you when the posted items are on their way.");
  // Paid for stock that had gone (028). The reason is for the shop, not the
  // customer; this only says someone will be in touch.
  if (order.needsAttention) {
    next.push(`One of your items needs checking. We will contact you shortly; you can also call us on ${SHOP.phone}.`);
  }

  const posted = hasPosting(order) && order.address.length > 0
    ? `${paragraph("Posting to:")}${addressHtml(order.address)}`
    : "";

  return {
    subject: `Order ${order.orderNumber} confirmed`,
    html: layout(
      "Your order is confirmed",
      paragraph(intro) + itemsTable(order) + posted + next.map(paragraph).join(""),
    ),
    text: [
      intro,
      itemsText(order),
      hasPosting(order) && order.address.length > 0 ? `Posting to:\n${order.address.join("\n")}` : "",
      ...next,
      `${SHOP.name}, ${SHOP.phone}`,
    ].filter(Boolean).join("\n\n"),
  };
}
