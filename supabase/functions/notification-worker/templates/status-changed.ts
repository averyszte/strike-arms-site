import type { EmailOrder } from "../load-order.ts";
import { COLLECTION_NOTE, layout, paragraph, SHOP, type RenderedEmail } from "./layout.ts";

/**
 * To the customer when their order is ready to collect or has been posted.
 * 030 queues only those two statuses. A mixed order gets one of each, so the
 * wording names which part of the order it is about.
 */
export function statusChangedEmail(order: EmailOrder, status: string): RenderedEmail {
  const isMixed = order.fulfillmentMethod === "mixed";

  if (status === "ready_for_pickup") {
    const lines = [
      isMixed
        ? `Hi ${order.customerName}, the collect-in-store items from order ${order.orderNumber} are ready.`
        : `Hi ${order.customerName}, order ${order.orderNumber} is ready to collect.`,
      COLLECTION_NOTE,
      `Questions? Call us on ${SHOP.phone}.`,
    ];
    return {
      subject: `Order ${order.orderNumber} is ready to collect`,
      html: layout("Ready to collect", lines.map(paragraph).join("")),
      text: lines.join("\n\n"),
    };
  }

  if (status === "shipped") {
    const lines = [
      isMixed
        ? `Hi ${order.customerName}, the posted items from order ${order.orderNumber} are on their way.`
        : `Hi ${order.customerName}, order ${order.orderNumber} is on its way.`,
      "Delivery within Ireland usually takes one to three working days.",
      `Questions? Call us on ${SHOP.phone}.`,
    ];
    return {
      subject: `Order ${order.orderNumber} is on its way`,
      html: layout("On its way", lines.map(paragraph).join("")),
      text: lines.join("\n\n"),
    };
  }

  throw new Error(`No status email for ${status}`);
}
