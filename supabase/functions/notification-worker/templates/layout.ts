import { escapeHtml } from "../../_shared/escape-html.ts";

/**
 * The shared shell and building blocks for every Strike Arms email: the order
 * emails sent here and the auth emails pasted into Supabase (built from this
 * file by scripts/emails/render-emails.ts).
 *
 * Tables and inline styles only: mail clients strip <style> blocks and
 * Outlook ignores most layout CSS. Plain text is built alongside the HTML so
 * clients that block HTML still get the whole message.
 */

export type RenderedEmail = { subject: string; html: string; text: string };

// Mirrors BUSINESS in the site's lib/site-config.ts. Change both together.
export const SHOP = {
  name: "Strike Arms",
  address: "Unit C3, Airside Enterprise Centre, Swords, Co. Dublin, K67 T9H9",
  phone: "+353 87 273 6351",
  hours: "Tuesday to Sunday, 11:00 to 18:00",
};

// The site's dark background and orange primary (index.css).
export const COLOURS = {
  ink: "#0d0d0d",
  text: "#33302c",
  muted: "#77716a",
  line: "#e6e2dc",
  page: "#f2f0ed",
  panel: "#f7f5f2",
  orange: "#ff5a1f",
};

const FONT = "Arial,Helvetica,sans-serif";

export function euros(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

export function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.6;color:${COLOURS.text};">${escapeHtml(text)}</p>`;
}

/** A small grey line, for fine print under a button or a code. */
export function note(text: string): string {
  return `<p style="margin:0 0 16px;font-family:${FONT};font-size:13px;line-height:1.5;color:${COLOURS.muted};">${escapeHtml(text)}</p>`;
}

/** The main action. One per email; a table so Outlook draws the padding. */
export function button(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;"><tr>
<td style="background:${COLOURS.orange};border-radius:4px;">
<a href="${escapeHtml(url)}" style="display:inline-block;padding:14px 26px;font-family:${FONT};font-size:15px;font-weight:bold;color:${COLOURS.ink};text-decoration:none;">${escapeHtml(label)}</a>
</td></tr></table>`;
}

/** A secondary text link on its own line. */
export function textLink(label: string, url: string): string {
  return `<p style="margin:0 0 16px;font-family:${FONT};font-size:14px;line-height:1.5;"><a href="${escapeHtml(url)}" style="color:${COLOURS.ink};font-weight:bold;text-decoration:underline;">${escapeHtml(label)}</a></p>`;
}

/** A shaded box with a small label, for "what happens next" style details. */
export function panel(title: string, lines: string[]): string {
  const body = lines
    .map((line) => `<div style="font-family:${FONT};font-size:14px;line-height:1.55;color:${COLOURS.text};">${escapeHtml(line)}</div>`)
    .join(`<div style="height:6px;line-height:6px;font-size:6px;">&nbsp;</div>`);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;"><tr>
<td style="background:${COLOURS.panel};border-left:3px solid ${COLOURS.orange};padding:14px 16px;">
<div style="margin:0 0 6px;font-family:${FONT};font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${COLOURS.muted};">${escapeHtml(title)}</div>
${body}
</td></tr></table>`;
}

/** A one-time code, large and spaced so it is easy to read and type. */
export function codeBox(code: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px;"><tr>
<td style="background:${COLOURS.panel};border:1px solid ${COLOURS.line};border-radius:4px;padding:14px 22px;font-family:'Courier New',Courier,monospace;font-size:28px;font-weight:bold;letter-spacing:6px;color:${COLOURS.ink};">${escapeHtml(code)}</td>
</tr></table>`;
}

export type EmailShell = {
  /** The grey line inbox lists show after the subject. */
  preheader: string;
  /** Small orange label above the heading, such as the order number. */
  eyebrow?: string;
  heading: string;
  body: string;
};

function footer(): string {
  return `<td style="padding:20px 8px 32px;font-family:${FONT};font-size:12px;line-height:1.6;color:${COLOURS.muted};text-align:center;">
<strong style="color:${COLOURS.text};">${escapeHtml(SHOP.name)}</strong><br>
${escapeHtml(SHOP.address)}<br>
${escapeHtml(SHOP.phone)} · ${escapeHtml(SHOP.hours)}
</td>`;
}

export function layout(shell: EmailShell): string {
  const eyebrow = shell.eyebrow
    ? `<div style="margin:0 0 8px;font-family:${FONT};font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${COLOURS.orange};">${escapeHtml(shell.eyebrow)}</div>`
    : "";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(shell.heading)}</title></head>
<body style="margin:0;padding:0;background:${COLOURS.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(shell.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLOURS.page};"><tr><td align="center" style="padding:24px 12px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
<tr><td style="background:${COLOURS.ink};border-bottom:3px solid ${COLOURS.orange};padding:18px 28px;font-family:${FONT};font-size:18px;font-weight:bold;letter-spacing:4px;color:#ffffff;">STRIKE <span style="color:${COLOURS.orange};">ARMS</span></td></tr>
<tr><td style="background:#ffffff;padding:32px 28px 16px;">
${eyebrow}<h1 style="margin:0 0 20px;font-family:${FONT};font-size:24px;line-height:1.25;color:${COLOURS.ink};">${escapeHtml(shell.heading)}</h1>
${shell.body}
</td></tr>
<tr>${footer()}</tr>
</table>
</td></tr></table>
</body></html>`;
}
