import { escapeHtml } from "../../_shared/escape-html.ts";
import type { EmailOrder } from "../load-order.ts";

/**
 * The shared shell and blocks for every order email. Inline styles only:
 * mail clients strip <style> blocks. Plain text is built alongside the HTML
 * so clients that block HTML still get the whole message.
 */

export type RenderedEmail = { subject: string; html: string; text: string };

// Mirrors BUSINESS in the site's lib/site-config.ts. Change both together.
export const SHOP = {
  name: "Strike Arms",
  address: "Unit C3, Airside Enterprise Centre, Swords, Co. Dublin, K67 T9H9",
  phone: "+353 87 273 6351",
  hours: "Tuesday to Sunday, 11:00 to 18:00",
};

export function euros(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.5;color:#222;">${escapeHtml(text)}</p>`;
}

/** A text link on its own line. The URL is escaped like any other text. */
export function linkParagraph(label: string, url: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.5;"><a href="${escapeHtml(url)}" style="color:#111;font-weight:bold;">${escapeHtml(label)}</a></p>`;
}

export function layout(heading: string, bodyHtml: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:560px;margin:0 auto;padding:24px;">
<div style="background:#111;color:#fff;padding:16px 20px;font-size:18px;font-weight:bold;letter-spacing:1px;">STRIKE ARMS</div>
<div style="background:#fff;padding:24px 20px;">
<h1 style="margin:0 0 18px;font-size:20px;color:#111;">${escapeHtml(heading)}</h1>
${bodyHtml}
</div>
<div style="padding:16px 4px;font-size:12px;line-height:1.5;color:#777;">
${escapeHtml(SHOP.name)} · ${escapeHtml(SHOP.address)}<br>
${escapeHtml(SHOP.phone)} · ${escapeHtml(SHOP.hours)}
</div>
</div>
</body></html>`;
}

export function itemsTable(order: EmailOrder): string {
  const rows = order.items
    .map(
      (item) => `<tr>
<td style="padding:6px 0;font-size:14px;color:#222;">${escapeHtml(item.name)} × ${item.quantity}<br>
<span style="font-size:12px;color:#777;">${item.isPosted ? "Posted" : "Collect in store"}</span></td>
<td style="padding:6px 0;font-size:14px;color:#222;text-align:right;white-space:nowrap;">${euros(item.subtotalCents)}</td>
</tr>`,
    )
    .join("");
  const shipping = order.shippingCents > 0
    ? `<tr><td style="padding:4px 0;font-size:13px;color:#555;">Delivery</td><td style="text-align:right;font-size:13px;color:#555;">${euros(order.shippingCents)}</td></tr>`
    : "";
  return `<table style="width:100%;border-collapse:collapse;margin:0 0 18px;border-top:1px solid #ddd;">
${rows}${shipping}
<tr><td style="padding:8px 0 0;font-size:15px;font-weight:bold;border-top:1px solid #ddd;">Total</td>
<td style="padding:8px 0 0;font-size:15px;font-weight:bold;text-align:right;border-top:1px solid #ddd;">${euros(order.totalCents)}</td></tr>
<tr><td colspan="2" style="padding:2px 0 0;font-size:12px;color:#777;">Includes VAT of ${euros(order.vatCents)}</td></tr>
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

export function addressHtml(lines: string[]): string {
  return `<p style="margin:0 0 14px;font-size:14px;line-height:1.5;color:#222;">${lines.map(escapeHtml).join("<br>")}</p>`;
}

export const COLLECTION_NOTE =
  `Collection is from our shop at ${SHOP.address}, ${SHOP.hours}. Bring photo ID showing you are 18 or over.`;

export function hasCollection(order: EmailOrder): boolean {
  return order.items.some((item) => !item.isPosted);
}

export function hasPosting(order: EmailOrder): boolean {
  return order.items.some((item) => item.isPosted);
}
