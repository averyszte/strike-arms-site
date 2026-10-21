import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { RenderedEmail } from "../functions/notification-worker/templates/layout.ts";
import { orderConfirmedEmail } from "../functions/notification-worker/templates/order-confirmed.ts";
import { ownerOrderPaidEmail } from "../functions/notification-worker/templates/owner-order-paid.ts";
import { refundedEmail } from "../functions/notification-worker/templates/refunded.ts";
import { statusChangedEmail } from "../functions/notification-worker/templates/status-changed.ts";
import { AUTH_EMAILS } from "./auth-emails.ts";
import { pastePage } from "./paste-page.ts";
import { COLLECT_ORDER, MIXED_ORDER, PART_REFUNDED_ORDER, POSTED_ORDER } from "./sample-orders.ts";

/**
 * Writes the Supabase Auth templates next to this file, plus
 * paste-into-supabase.html, a page with copy buttons for pasting them into the
 * dashboard. With --preview <dir>, also renders every order email with the
 * sample orders, plus an index page, so the whole set can be looked over.
 *
 *   node supabase/templates/render.ts
 *   node supabase/templates/render.ts --preview <dir>
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = "https://strikearms.ie";

for (const email of AUTH_EMAILS) {
  writeFileSync(join(HERE, `${email.file}.html`), email.html);
}
writeFileSync(join(HERE, "paste-into-supabase.html"), pastePage(AUTH_EMAILS));

const previewFlag = process.argv.indexOf("--preview");
if (previewFlag !== -1) {
  const dir = process.argv[previewFlag + 1];
  mkdirSync(dir, { recursive: true });

  const orderEmails: [string, RenderedEmail][] = [
    ["Customer: order confirmed (posted)", orderConfirmedEmail(POSTED_ORDER, SITE)],
    ["Customer: order confirmed (collect)", orderConfirmedEmail(COLLECT_ORDER, SITE)],
    ["Customer: order confirmed (mixed, flagged)", orderConfirmedEmail(MIXED_ORDER, SITE)],
    ...["packed", "shipped", "delivered"].map((status): [string, RenderedEmail] => [
      `Customer: ${status}`,
      statusChangedEmail(POSTED_ORDER, status, SITE),
    ]),
    ...["ready_for_pickup", "collected"].map((status): [string, RenderedEmail] => [
      `Customer: ${status}`,
      statusChangedEmail(COLLECT_ORDER, status, SITE),
    ]),
    ["Customer: shipped (mixed)", statusChangedEmail(MIXED_ORDER, "shipped", SITE)],
    ["Customer: cancelled", statusChangedEmail(POSTED_ORDER, "cancelled", SITE)],
    ["Customer: part refund", refundedEmail(PART_REFUNDED_ORDER, 1900)],
    ["Alan: new order", ownerOrderPaidEmail(POSTED_ORDER, `${SITE}/admin/orders`)],
    ["Alan: new order (flagged)", ownerOrderPaidEmail(MIXED_ORDER, `${SITE}/admin/orders`)],
  ];
  const all = [
    ...orderEmails.map(([label, email]) => ({ label, subject: email.subject, html: email.html })),
    ...AUTH_EMAILS.map((email) => ({ label: `Auth: ${email.file}`, subject: email.subject, html: email.html })),
  ];

  const links = all.map((email, index) => {
    const file = `${String(index + 1).padStart(2, "0")}.html`;
    writeFileSync(join(dir, file), email.html);
    return `<li><a href="${file}">${email.label}</a> <span style="color:#777">- ${email.subject}</span></li>`;
  });
  writeFileSync(
    join(dir, "index.html"),
    `<!doctype html><meta charset="utf-8"><title>Email previews</title><body style="font-family:Arial;padding:24px"><h1>Strike Arms emails</h1><ol>${links.join("")}</ol></body>`,
  );
}
