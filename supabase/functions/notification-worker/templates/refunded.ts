import type { EmailOrder } from "../load-order.ts";
import { euros, layout, panel, paragraph, SHOP, type RenderedEmail } from "./layout.ts";

// Where the money goes, by how the order was paid (orders.payment_method).
const CARD_ROUTE = "It goes back to the card you paid with. Banks usually take five to ten working days to show it.";
const REFUND_ROUTE: Record<string, string> = {
  stripe: CARD_ROUTE,
  card_terminal: CARD_ROUTE,
  cash: "It was refunded in cash at the shop.",
  bank_transfer: "It goes back to the account you paid from.",
};

/** To the customer when a refund is recorded, full or part. */
export function refundedEmail(order: EmailOrder, refundedNowCents: number): RenderedEmail {
  const isFull = order.refundCents >= order.totalCents;
  const intro = `Hi ${order.customerName}, we have refunded ${euros(refundedNowCents)} for order ${order.orderNumber}.`;
  const amount = isFull
    ? "That is the full amount of the order."
    : `In total ${euros(order.refundCents)} of ${euros(order.totalCents)} has now been refunded.`;
  const route = REFUND_ROUTE[order.paymentMethod] ?? "We will be in touch about how it reaches you.";
  const questions = `Questions? Call us on ${SHOP.phone} or reply to this email.`;

  const html = layout({
    preheader: `${euros(refundedNowCents)} refunded for order ${order.orderNumber}.`,
    eyebrow: `Order ${order.orderNumber}`,
    heading: `${euros(refundedNowCents)} refunded`,
    body: paragraph(intro) + panel("Where the money goes", [amount, route]) + paragraph(questions),
  });

  return {
    subject: `Refund for order ${order.orderNumber}`,
    html,
    text: [intro, amount, route, questions].join("\n\n"),
  };
}
