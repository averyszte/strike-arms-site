import type { EmailOrder } from "../load-order.ts";
import { COLLECTION_NOTE, layout, linkParagraph, paragraph, SHOP, type RenderedEmail } from "./layout.ts";

/**
 * To the customer on every forward step of their order (033 decides which
 * changes queue one). A mixed order walks both lanes, so its wording names
 * which part of the order the step is about.
 */

type StatusCopy = {
  subject: string;
  heading: string;
  lines: string[];
};

const AN_POST_TRACKING = "https://www.anpost.com/Post-Parcels/Track/History?item=";

function statusCopy(order: EmailOrder, status: string): StatusCopy {
  const isMixed = order.fulfillmentMethod === "mixed";
  const hi = `Hi ${order.customerName},`;
  const number = order.orderNumber;

  switch (status) {
    case "packed":
      return {
        subject: `Order ${number} is being packed`,
        heading: "Being packed",
        lines: [
          isMixed
            ? `${hi} we are packing the posted items from order ${number}.`
            : `${hi} we are packing order ${number}.`,
          "We will email you again when it is in the post.",
        ],
      };
    case "shipped":
      return {
        subject: `Order ${number} is on its way`,
        heading: "On its way",
        lines: [
          isMixed
            ? `${hi} the posted items from order ${number} are on their way.`
            : `${hi} order ${number} is on its way.`,
          "Delivery within Ireland usually takes one to three working days.",
        ],
      };
    case "delivered":
      return {
        subject: `Order ${number} has been delivered`,
        heading: "Delivered",
        lines: [
          isMixed
            ? `${hi} the posted items from order ${number} have been delivered.`
            : `${hi} order ${number} has been delivered.`,
          "If anything is missing or not right, call us and we will sort it out.",
        ],
      };
    case "ready_for_pickup":
      return {
        subject: `Order ${number} is ready to collect`,
        heading: "Ready to collect",
        lines: [
          isMixed
            ? `${hi} the collect-in-store items from order ${number} are ready.`
            : `${hi} order ${number} is ready to collect.`,
          COLLECTION_NOTE,
        ],
      };
    case "collected":
      return {
        subject: `Order ${number} has been collected`,
        heading: "Collected",
        lines: [
          isMixed
            ? `${hi} the collect-in-store items from order ${number} have been collected.`
            : `${hi} order ${number} has been collected. Thanks for shopping with us.`,
        ],
      };
    case "cancelled":
      return {
        subject: `Order ${number} has been cancelled`,
        heading: "Order cancelled",
        lines: [
          `${hi} order ${number} has been cancelled.`,
          "If a refund is due, we will email you when it has been issued.",
        ],
      };
    default:
      throw new Error(`No status email for ${status}`);
  }
}

/** The An Post link, only once the parcel is in the post and has a number. */
function postTrackingUrl(order: EmailOrder, status: string): string | null {
  if (!order.trackingNumber || (status !== "shipped" && status !== "delivered")) return null;
  return AN_POST_TRACKING + encodeURIComponent(order.trackingNumber);
}

export function statusChangedEmail(order: EmailOrder, status: string, siteUrl: string): RenderedEmail {
  const copy = statusCopy(order, status);
  const lines = [...copy.lines, `Questions? Call us on ${SHOP.phone}.`];
  const trackUrl = `${siteUrl}/account?order=${encodeURIComponent(order.orderNumber)}`;
  const postUrl = postTrackingUrl(order, status);

  const links = [
    ...(postUrl ? [{ label: `Track with An Post (${order.trackingNumber})`, url: postUrl }] : []),
    { label: "See your order", url: trackUrl },
  ];

  return {
    subject: copy.subject,
    html: layout(
      copy.heading,
      lines.map(paragraph).join("") + links.map((link) => linkParagraph(link.label, link.url)).join(""),
    ),
    text: [...lines, ...links.map((link) => `${link.label}: ${link.url}`)].join("\n\n"),
  };
}
