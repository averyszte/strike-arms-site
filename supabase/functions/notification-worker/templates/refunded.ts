import type { EmailOrder } from "../load-order.ts";
import { euros, layout, paragraph, SHOP, type RenderedEmail } from "./layout.ts";

// Where the money goes, by how the order was paid (orders.payment_method).
const REFUND_ROUTE: Record<string, string> = {
  stripe: "It goes back to the card you paid with. Banks usually take five to ten working days to show it.",
  card_terminal: "It goes back to the card you paid with. Banks usually take five to ten working days to show it.",
  cash: "It was refunded in cash at the shop.",
  bank_transfer: "It goes back to the account you paid from.",
};

/** To the customer when a refund is recorded, full or part. */
export function refundedEmail(order: EmailOrder, refundedNowCents: number): RenderedEmail {
  const isFull = order.refundCents >= order.totalCents;
  const lines = [
    `Hi ${order.customerName}, we have refunded ${euros(refundedNowCents)} for order ${order.orderNumber}.`,
    isFull
      ? "That is the full amount of the order."
      : `In total ${euros(order.refundCents)} of ${euros(order.totalCents)} has been refunded.`,
    REFUND_ROUTE[order.paymentMethod] ?? "We will be in touch about how it reaches you.",
    `Questions? Call us on ${SHOP.phone}.`,
  ];
  return {
    subject: `Refund for order ${order.orderNumber}`,
    html: layout("Your refund", lines.map(paragraph).join("")),
    text: lines.join("\n\n"),
  };
}
