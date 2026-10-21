import type { EmailOrder } from "../functions/notification-worker/load-order.ts";

/** Made-up orders for previewing the order emails. Never sent. */

const base: EmailOrder = {
  id: "00000000-0000-0000-0000-000000000000",
  orderNumber: "SA-1042",
  customerName: "Ciara Byrne",
  customerEmail: "ciara@example.com",
  customerPhone: "+353 87 000 0000",
  channel: "web",
  paymentMethod: "stripe",
  fulfillmentMethod: "delivery",
  totalCents: 31450,
  shippingCents: 650,
  vatCents: 5881,
  refundCents: 0,
  address: ["Ciara Byrne", "12 Main Street", "Malahide", "Co. Dublin", "K36 AB12"],
  notes: null,
  trackingNumber: "CE123456789IE",
  needsAttention: false,
  items: [
    { name: "Tokyo Marui MWS GBB Rifle", quantity: 1, subtotalCents: 28900, isPosted: true },
    { name: "Green gas, 1000 ml", quantity: 2, subtotalCents: 1900, isPosted: true },
  ],
};

export const POSTED_ORDER = base;

export const COLLECT_ORDER: EmailOrder = {
  ...base,
  orderNumber: "SA-1043",
  fulfillmentMethod: "pickup",
  shippingCents: 0,
  totalCents: 30800,
  vatCents: 5759,
  address: [],
  trackingNumber: null,
  items: base.items.map((item) => ({ ...item, isPosted: false })),
};

export const MIXED_ORDER: EmailOrder = {
  ...base,
  orderNumber: "SA-1044",
  fulfillmentMethod: "mixed",
  needsAttention: true,
  notes: "Can you check the hop-up before posting? Thanks.",
  items: [
    { name: "Tokyo Marui MWS GBB Rifle", quantity: 1, subtotalCents: 28900, isPosted: false },
    { name: "Green gas, 1000 ml", quantity: 2, subtotalCents: 1900, isPosted: true },
  ],
};

export const PART_REFUNDED_ORDER: EmailOrder = { ...base, refundCents: 1900 };
