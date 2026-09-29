import { requireEnv } from "./env.ts";

/**
 * Sends one email through Resend. Ported from All Blooms.
 *
 * EMAIL_FROM has no fallback: the sending domain is not set up yet, and a
 * guessed sender would be rejected by Resend or land in spam. Both secrets
 * are required, so a missing one fails on the first send, naming itself.
 *
 * The idempotency key is what stops a retried job sending twice: Resend
 * treats a repeat of the same key within 24 hours as the same email. The
 * notification worker passes its job id.
 */

const RESEND_API_URL = "https://api.resend.com/emails";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  /** Plain-text alternative; mail clients that block HTML show this. */
  text?: string;
  /** For Alan's alerts, so "reply" goes to the customer. */
  replyTo?: string;
  idempotencyKey?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${requireEnv("RESEND_API_KEY")}`,
    "Content-Type": "application/json",
  };
  if (input.idempotencyKey) headers["Idempotency-Key"] = input.idempotencyKey;

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      from: requireEnv("EMAIL_FROM"),
      to: [input.to],
      subject: input.subject,
      html: input.html,
      ...(input.text ? { text: input.text } : {}),
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend error ${res.status}: ${await res.text()}`);
  }
}
