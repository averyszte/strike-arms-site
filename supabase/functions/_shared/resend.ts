import { requireEnv } from "./env.ts";

/**
 * Sends one email through Resend. Ported from All Blooms.
 *
 * EMAIL_FROM has no fallback: a guessed sender would be rejected by Resend
 * or land in spam. Both secrets are required, so a missing one fails on the
 * first send, naming itself.
 *
 * The idempotency key is what stops a retried job sending twice: Resend
 * treats a repeat of the same key within 24 hours as the same email. The
 * notification worker passes its job id.
 *
 * Failures (M-010) are thrown as EmailSendError, which says whether trying
 * again later can help:
 *   - no reply within SEND_TIMEOUT_MS, or no connection: retry;
 *   - 429 (too many requests): one quick retry here, then retry later;
 *   - 5xx: retry later;
 *   - 401 and 403: retry later. They mean the API key or the account is
 *     wrong, not this email, so the job should go once the key is fixed
 *     rather than be dead-lettered on its first try;
 *   - 408 and 409 (a timed-out or still-running request with the same
 *     idempotency key): retry later;
 *   - any other 4xx (a bad address, a rejected payload): permanent.
 */

const RESEND_API_URL = "https://api.resend.com/emails";
const SEND_TIMEOUT_MS = 10_000;
const RATE_LIMIT_WAIT_MS = 1_000;
const RATE_LIMIT_MAX_WAIT_MS = 2_000;
const MAX_ERROR_DETAIL = 300;

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

export class EmailSendError extends Error {
  /** Resend's HTTP status, or null when no reply came back. */
  readonly httpStatus: number | null;
  /** Whether sending the same email later can succeed. */
  readonly isRetryable: boolean;

  constructor(message: string, httpStatus: number | null, isRetryable: boolean) {
    super(message);
    this.name = "EmailSendError";
    this.httpStatus = httpStatus;
    this.isRetryable = isRetryable;
  }

  /** Resend itself is down or refusing every email, not just this one. */
  get isServiceWide(): boolean {
    const status = this.httpStatus;
    return status === null || status === 401 || status === 403 || status >= 500;
  }
}

export function isRetryableEmailStatus(status: number): boolean {
  return status === 401 || status === 403 || status === 408 || status === 409 ||
    status === 429 || status >= 500;
}

async function post(headers: Record<string, string>, body: string): Promise<Response> {
  try {
    return await fetch(RESEND_API_URL, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });
  } catch (error) {
    const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
    const reason = isTimeout
      ? `no reply within ${SEND_TIMEOUT_MS / 1000} seconds`
      : error instanceof Error ? error.message : String(error);
    throw new EmailSendError(`Resend unreachable: ${reason}`, null, true);
  }
}

function rateLimitWaitMs(res: Response): number {
  const seconds = Number(res.headers.get("retry-after"));
  if (!Number.isFinite(seconds) || seconds <= 0) return RATE_LIMIT_WAIT_MS;
  return Math.min(seconds * 1000, RATE_LIMIT_MAX_WAIT_MS);
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${requireEnv("RESEND_API_KEY")}`,
    "Content-Type": "application/json",
  };
  if (input.idempotencyKey) headers["Idempotency-Key"] = input.idempotencyKey;

  const body = JSON.stringify({
    from: requireEnv("EMAIL_FROM"),
    to: [input.to],
    subject: input.subject,
    html: input.html,
    ...(input.text ? { text: input.text } : {}),
    ...(input.replyTo ? { reply_to: input.replyTo } : {}),
  });

  let res = await post(headers, body);
  if (res.status === 429) {
    const waitMs = rateLimitWaitMs(res);
    await res.body?.cancel();
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    res = await post(headers, body);
  }

  if (res.ok) {
    await res.body?.cancel();
    return;
  }

  const detail = (await res.text().catch(() => "")).slice(0, MAX_ERROR_DETAIL);
  throw new EmailSendError(
    `Resend error ${res.status}: ${detail}`,
    res.status,
    isRetryableEmailStatus(res.status),
  );
}
