import assert from "node:assert/strict";
import { test } from "node:test";

import type { AdminCustomer } from "@/types/admin-customer";

import {
  computeCustomerStats,
  filterAndSortCustomers,
  median,
  percentOf,
  signupsByMonth,
} from "./customer-stats.ts";
import { customersToCsv, mailingListToCsv } from "./customers-csv.ts";

// Local times, so the month buckets do not depend on the machine time zone.
const NOW = new Date(2026, 10, 16, 12);

function customer(overrides: Partial<AdminCustomer>): AdminCustomer {
  return {
    userId: "u",
    email: "a@example.com",
    fullName: "",
    phone: "",
    isMarketingOptIn: false,
    marketingOptInAt: null,
    createdAt: new Date(2026, 10, 10).toISOString(),
    emailConfirmedAt: null,
    lastSignInAt: null,
    orderCount: 0,
    spentCents: 0,
    lastOrderAt: null,
    ...overrides,
  };
}

const CUSTOMERS = [
  customer({ userId: "1", email: "sean@example.com", fullName: "Seán Ó Briain", orderCount: 2, spentCents: 30000, emailConfirmedAt: "x", isMarketingOptIn: true, marketingOptInAt: new Date(2026, 10, 12, 9).toISOString(), phone: "+353 87 123 4567" }),
  customer({ userId: "2", email: "aoife@example.com", orderCount: 1, spentCents: 10000, emailConfirmedAt: "x", createdAt: new Date(2026, 9, 1).toISOString() }),
  customer({ userId: "3", email: "niamh@example.com", createdAt: new Date(2026, 5, 1).toISOString() }),
];

test("stats count accounts, new sign-ups, orders and spend", () => {
  const stats = computeCustomerStats(CUSTOMERS, NOW);
  assert.equal(stats.total, 3);
  assert.equal(stats.newLast30Days, 1);
  assert.equal(stats.newPrevious30Days, 1);
  assert.equal(stats.confirmed, 2);
  assert.equal(stats.marketingOptIns, 1);
  assert.equal(stats.withOrders, 2);
  assert.equal(stats.repeat, 1);
  assert.equal(stats.spentCents, 40000);
  assert.equal(stats.medianSpendCents, 20000);
});

test("stats with no customers are all zero, not NaN", () => {
  const stats = computeCustomerStats([], NOW);
  assert.equal(stats.medianSpendCents, 0);
  assert.equal(percentOf(stats.withOrders, stats.total), 0);
});

test("sign-ups by month end with this month and keep empty months", () => {
  const rows = signupsByMonth(CUSTOMERS, NOW);
  assert.equal(rows.length, 6);
  assert.deepEqual(rows[5], { label: "Nov 2026", count: 1 });
  assert.deepEqual(rows[4], { label: "Oct 2026", count: 1 });
  assert.deepEqual(rows[0], { label: "Jun 2026", count: 1 });
  assert.equal(rows[1].count, 0);
});

test("search matches name, email or phone, ignoring case", () => {
  assert.deepEqual(filterAndSortCustomers(CUSTOMERS, "SEÁN", "newest").map((c) => c.userId), ["1"]);
  assert.deepEqual(filterAndSortCustomers(CUSTOMERS, "aoife@", "newest").map((c) => c.userId), ["2"]);
});

test("sorting by spend puts the biggest spender first and leaves the input alone", () => {
  const input = [...CUSTOMERS].reverse();
  assert.deepEqual(filterAndSortCustomers(input, "", "spent").map((c) => c.userId), ["1", "2", "3"]);
  assert.equal(input[0].userId, "3");
});

test("the export has a row per customer with plain money", () => {
  const csv = customersToCsv(CUSTOMERS);
  const lines = csv.trim().split("\r\n");
  assert.equal(lines.length, 4);
  assert.ok(lines[1].includes('"300.00"'));
  assert.ok(lines[1].includes('"Seán Ó Briain"'));
});

test("median ignores one big spender and handles even counts", () => {
  assert.equal(median([1000, 2000, 900000]), 2000);
  assert.equal(median([1000, 3000]), 2000);
  assert.equal(median([]), 0);
});

test("a fully refunded customer counts as ordered but not in typical spend", () => {
  const refunded = customer({ userId: "4", orderCount: 1, spentCents: 0 });
  const stats = computeCustomerStats([...CUSTOMERS, refunded], NOW);
  assert.equal(stats.withOrders, 3);
  assert.equal(stats.medianSpendCents, 20000);
});

test("a sign-up stamped slightly in the future still counts as new", () => {
  const ahead = customer({ createdAt: new Date(NOW.getTime() + 5000).toISOString() });
  assert.equal(computeCustomerStats([ahead], NOW).newLast30Days, 1);
});

test("phone search matches on digits whatever the spacing", () => {
  assert.deepEqual(filterAndSortCustomers(CUSTOMERS, "087 1234", "newest").map((c) => c.userId), []);
  assert.deepEqual(filterAndSortCustomers(CUSTOMERS, "87 123 4", "newest").map((c) => c.userId), ["1"]);
  assert.deepEqual(filterAndSortCustomers(CUSTOMERS, "871234567", "newest").map((c) => c.userId), ["1"]);
});

test("the mailing list has only opt-ins, with the local opt-in day", () => {
  const lines = mailingListToCsv(CUSTOMERS).trim().split("\r\n");
  assert.equal(lines.length, 2);
  assert.ok(lines[1].includes('"sean@example.com"'));
  assert.ok(lines[1].includes('"2026-11-12"'));
});
