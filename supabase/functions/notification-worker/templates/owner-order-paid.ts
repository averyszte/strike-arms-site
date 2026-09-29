import type { EmailOrder } from "../load-order.ts";
import {
  addressHtml,
  hasPosting,
  itemsTable,
  itemsText,
  layout,
  paragraph,
  type RenderedEmail,
} from "./layout.ts";

const METHOD_LABELS: Record<EmailOrder["fulfillmentMethod"], string> = {
  pickup: "Collect in store",
  delivery: "Post",
  mixed: "Some collect, some post",
};

/** To Alan, when a web order is paid. Reply goes to the customer. */
export function ownerOrderPaidEmail(order: EmailOrder, adminUrl: string): RenderedEmail {
  const contact = [order.customerName, order.customerEmail, order.customerPhone]
    .filter((part): part is string => Boolean(part));
  const warning = order.needsAttention
    ? paragraph("NEEDS ATTENTION: an item was out of stock when this was paid. See the order in the admin.")
    : "";
  const posting = hasPosting(order) && order.address.length > 0
    ? `${paragraph("Post to:")}${addressHtml(order.address)}`
    : "";
  const notes = order.notes ? paragraph(`Notes: ${order.notes}`) : "";

  return {
    subject: `${order.needsAttention ? "[Needs attention] " : ""}New order ${order.orderNumber} from ${order.customerName}`,
    html: layout(
      `New order ${order.orderNumber}`,
      warning +
        paragraph(contact.join(" · ")) +
        paragraph(METHOD_LABELS[order.fulfillmentMethod]) +
        itemsTable(order) +
        posting +
        notes +
        paragraph(`Open it in the admin: ${adminUrl}`),
    ),
    text: [
      order.needsAttention ? "NEEDS ATTENTION: an item was out of stock when this was paid." : "",
      contact.join(" / "),
      METHOD_LABELS[order.fulfillmentMethod],
      itemsText(order),
      hasPosting(order) && order.address.length > 0 ? `Post to:\n${order.address.join("\n")}` : "",
      order.notes ? `Notes: ${order.notes}` : "",
      `Admin: ${adminUrl}`,
    ].filter(Boolean).join("\n\n"),
  };
}
