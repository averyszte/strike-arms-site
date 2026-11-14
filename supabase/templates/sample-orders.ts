import type { EmailOrder } from "../functions/notification-worker/load-order.ts";
import type { HealthDigest } from "../functions/notification-worker/templates/health-digest.ts";

/** Made-up orders and checks for previewing the emails. Never sent. */

const base: EmailOrder = {
  id: "00000000-0000-0000-0000-000000000000",
  orderNumber: "SA-1042",
  customerName: "Ciara Byrne",
  customerEmail: "ciara@example.com",
  customerPhone: "+353 87 000 0000",
  channel: "web",
  paymentMethod: "stripe",
  fulfillmentMethod: "delivery",
  fulfillmentStatus: "shipped",
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

export const FULLY_REFUNDED_ORDER: EmailOrder = { ...base, fulfillmentStatus: "cancelled", refundCents: base.totalCents };

export const SAMPLE_HEALTH_DIGEST: HealthDigest = {
  checkedAt: "2026-11-14T08:07:00Z",
  checks: [
    { check: "email_queue", status: "fail", detail: "0 emails overdue by 15 minutes or more; 3 failed in 7 days" },
    { check: "turnstile_failures", status: "warn", detail: "64 failed bot checks in 24 hours" },
  ],
};
