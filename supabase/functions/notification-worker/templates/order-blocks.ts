import { escapeHtml } from "../../_shared/escape-html.ts";
import type { EmailOrder } from "../load-order.ts";
import { COLOURS, euros, SHOP } from "./layout.ts";

/** Blocks about an order: what was bought, where it goes, how far along it is. */

const FONT = "Arial,Helvetica,sans-serif";
const CELL = `font-family:${FONT};font-size:14px;line-height:1.45;color:${COLOURS.text};`;

export const COLLECTION_LINES = [
  SHOP.address,
  SHOP.hours,
  "Bring photo ID showing you are 18 or over.",
];

export function hasCollection(order: EmailOrder): boolean {
  return order.items.some((item) => !item.isPosted);
}

export function hasPosting(order: EmailOrder): boolean {
  return order.items.some((item) => item.isPosted);
}

export function postingAddress(order: EmailOrder): string[] {
  return hasPosting(order) ? order.address : [];
}

function itemRow(item: EmailOrder["items"][number]): string {
  return `<tr>
<td style="padding:12px 0;border-bottom:1px solid ${COLOURS.line};${CELL}">${escapeHtml(item.name)}<br>
<span style="font-size:12px;color:${COLOURS.muted};">Qty ${item.quantity} · ${item.isPosted ? "Posted" : "Collect in store"}</span></td>
<td style="padding:12px 0 12px 12px;border-bottom:1px solid ${COLOURS.line};${CELL}text-align:right;white-space:nowrap;vertical-align:top;">${euros(item.subtotalCents)}</td>
</tr>`;
}

export function itemsTable(order: EmailOrder): string {
  const shipping = order.shippingCents > 0
    ? `<tr><td style="padding:10px 0 0;${CELL}color:${COLOURS.muted};">Delivery</td><td style="padding:10px 0 0;${CELL}color:${COLOURS.muted};text-align:right;">${euros(order.shippingCents)}</td></tr>`
    : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;border-top:2px solid ${COLOURS.ink};">
${order.items.map(itemRow).join("")}${shipping}
<tr><td style="padding:12px 0 0;font-family:${FONT};font-size:16px;font-weight:bold;color:${COLOURS.ink};">Total</td>
<td style="padding:12px 0 0;font-family:${FONT};font-size:16px;font-weight:bold;color:${COLOURS.ink};text-align:right;">${euros(order.totalCents)}</td></tr>
<tr><td colspan="2" style="padding:2px 0 0;font-family:${FONT};font-size:12px;color:${COLOURS.muted};">Includes VAT of ${euros(order.vatCents)}</td></tr>
</table>`;
}

export function itemsText(order: EmailOrder): string {
  const lines = order.items.map(
    (item) =>
      `- ${item.name} x ${item.quantity}: ${euros(item.subtotalCents)} (${item.isPosted ? "posted" : "collect in store"})`,
  );
  if (order.shippingCents > 0) lines.push(`Delivery: ${euros(order.shippingCents)}`);
  lines.push(`Total: ${euros(order.totalCents)} (includes VAT of ${euros(order.vatCents)})`);
  return lines.join("\n");
}

// The steps a customer sees, per lane. The index is how far along it is.
const POST_STEPS = ["Order placed", "Packed", "On its way", "Delivered"];
const COLLECT_STEPS = ["Order placed", "Ready to collect", "Collected"];

const STEP_POSITION: Record<string, { steps: string[]; reached: number }> = {
  paid_post: { steps: POST_STEPS, reached: 0 },
  paid_collect: { steps: COLLECT_STEPS, reached: 0 },
  packed: { steps: POST_STEPS, reached: 1 },
  shipped: { steps: POST_STEPS, reached: 2 },
  delivered: { steps: POST_STEPS, reached: 3 },
  ready_for_pickup: { steps: COLLECT_STEPS, reached: 1 },
  collected: { steps: COLLECT_STEPS, reached: 2 },
};

/**
 * A bar per step, orange up to where the order is. Empty for a step that is
 * not on a lane (cancelled), so the caller can always include it.
 */
export function progressSteps(position: string): string {
  const lane = STEP_POSITION[position];
  if (!lane) return "";
  const width = Math.floor(100 / lane.steps.length);
  const cells = lane.steps
    .map((label, index) => {
      const isReached = index <= lane.reached;
      const isCurrent = index === lane.reached;
      return `<td width="${width}%" style="padding:0 3px;vertical-align:top;">
<div style="height:4px;line-height:4px;font-size:4px;background:${isReached ? COLOURS.orange : COLOURS.line};">&nbsp;</div>
<div style="padding:8px 0 0;font-family:${FONT};font-size:12px;line-height:1.3;color:${isCurrent ? COLOURS.ink : COLOURS.muted};${isCurrent ? "font-weight:bold;" : ""}">${escapeHtml(label)}</div>
</td>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 24px;table-layout:fixed;"><tr>${cells}</tr></table>`;
}

export function trackOrderUrl(order: EmailOrder, siteUrl: string): string {
  return `${siteUrl}/account?order=${encodeURIComponent(order.orderNumber)}`;
}
