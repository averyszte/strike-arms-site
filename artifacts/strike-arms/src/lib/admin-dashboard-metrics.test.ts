import assert from "node:assert/strict";
import { test } from "node:test";

import type { Order } from "@/types/order";

import { buildRevenueRows, computeDashboardMetrics } from "./admin-dashboard-metrics.ts";

// Local times, so the month and day buckets do not depend on the machine time zone.
const local = (m: number, d: number, h: number) => new Date(2026, m - 1, d, h).toISOString();
const NOW = new Date(2026, 10, 14, 12);

function order(overrides: Partial<Order>): Order {
  return {
    id: "o1", orderNumber: "SA-2026-0001", stripeSessionId: null, stripePaymentIntent: null,
    customerName: "A", customerEmail: null, customerPhone: null, channel: "web",
    paymentMethod: "card", paymentStatus: "paid", fulfillmentStatus: "pending",
    fulfillmentMethod: "pickup", totalCents: 10000, vatCents: 0, refundCents: 0,
    shippingCents: 0, shippingAddress: null, paidAt: "2026-11-10T10:00:00Z", refundedAt: null,
    attentionReason: null, attentionRaisedAt: null, ageVerified: false, notes: null,
    trackingNumber: null, isArchived: false, createdAt: "2026-11-10T10:00:00Z",
    updatedAt: "2026-11-10T10:00:00Z", ...overrides,
  } as Order;
}

test("a partially refunded order counts, net of its refund", () => {
  const metrics = computeDashboardMetrics(
    [order({}), order({ id: "o2", paymentStatus: "partially_refunded", refundCents: 2500 })],
    NOW,
  );
  assert.equal(metrics.revenueAllTime, 17500);
  assert.equal(metrics.revenueThisMonth, 17500);
});

test("fully refunded and unpaid orders add nothing", () => {
  const metrics = computeDashboardMetrics(
    [
      order({ paymentStatus: "refunded", refundCents: 10000 }),
      order({ id: "o2", paymentStatus: "pending", paidAt: null }),
    ],
    NOW,
  );
  assert.equal(metrics.revenueAllTime, 0);
});

test("revenue is dated by paid_at, not created_at", () => {
  const metrics = computeDashboardMetrics(
    [order({ createdAt: local(10, 31, 23), paidAt: local(11, 1, 1) })],
    NOW,
  );
  assert.equal(metrics.revenueThisMonth, 10000);

  const rows = buildRevenueRows(
    [order({ createdAt: local(11, 13, 8), paidAt: local(11, 14, 8) })],
    "7d",
    NOW,
  );
  assert.equal(rows[rows.length - 1].revenue, 10000);
  assert.equal(rows[rows.length - 2].revenue, 0);
});

test("orders today counts paid orders and reports abandoned checkouts apart (N-083)", () => {
  const today = local(11, 14, 9);
  const metrics = computeDashboardMetrics(
    [
      order({ createdAt: today, paidAt: today }),
      order({ id: "o2", paymentStatus: "pending", paidAt: null, createdAt: today }),
      order({ id: "o3", paymentStatus: "expired", paidAt: null, createdAt: today }),
      order({ id: "o4", paymentStatus: "refunded", refundCents: 10000, createdAt: today, paidAt: today }),
    ],
    NOW,
  );
  assert.equal(metrics.ordersToday, 2);
  assert.equal(metrics.ordersThisMonth, 2);
  assert.equal(metrics.abandonedToday, 1);
});
