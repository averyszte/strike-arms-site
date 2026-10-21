import type { EmailOrder } from "../load-order.ts";
import { button, layout, panel, paragraph, type RenderedEmail } from "./layout.ts";
import { itemsTable, itemsText, postingAddress } from "./order-blocks.ts";

const METHOD_LABELS: Record<EmailOrder["fulfillmentMethod"], string> = {
  pickup: "Collect in store",
  delivery: "Post",
  mixed: "Some collect, some post",
};

/** To Alan, when a web order is paid. Reply goes to the customer. */
export function ownerOrderPaidEmail(order: EmailOrder, adminUrl: string): RenderedEmail {
  const contact = [order.customerName, order.customerEmail, order.customerPhone]
    .filter((part): part is string => Boolean(part));
  const address = postingAddress(order);
  const warning = "Needs attention: this order was flagged when it was paid. Check it in the admin before packing.";
  const method = METHOD_LABELS[order.fulfillmentMethod];

  const html = layout({
    preheader: `${order.customerName}, ${method.toLowerCase()}. Reply to this email to reach the customer.`,
    eyebrow: order.needsAttention ? "Needs attention" : "New web order",
    heading: `Order ${order.orderNumber}`,
    body:
      (order.needsAttention ? panel("Before you pack", [warning]) : "") +
      panel("Customer", contact) +
      panel("How it goes out", [method]) +
      itemsTable(order) +
      (address.length > 0 ? panel("Post to", address) : "") +
      (order.notes ? panel("Customer notes", [order.notes]) : "") +
      button("Open in the admin", adminUrl) +
      paragraph("Reply to this email to reach the customer."),
  });

  return {
    subject: `${order.needsAttention ? "[Needs attention] " : ""}New order ${order.orderNumber} from ${order.customerName}`,
    html,
    text: [
      order.needsAttention ? warning : "",
      contact.join(" / "),
      method,
      itemsText(order),
      address.length > 0 ? `Post to:\n${address.join("\n")}` : "",
      order.notes ? `Notes: ${order.notes}` : "",
      `Admin: ${adminUrl}`,
    ].filter(Boolean).join("\n\n"),
  };
}
