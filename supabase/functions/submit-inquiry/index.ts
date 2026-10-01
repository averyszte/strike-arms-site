import { corsHeadersFor, jsonResponse } from "../_shared/cors.ts";
import { clientIp } from "../_shared/client-ip.ts";
import { RATE_LIMITED_MESSAGE, withinRateLimits } from "../_shared/rate-limit.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { verifyTurnstile } from "../_shared/turnstile.ts";

/**
 * The contact form and the service quote form, both filed into `inquiries`.
 * Ported from All Blooms' submit-inquiry, with rate limits added.
 *
 * Before this the browser inserted straight into the table, so anyone with
 * the anon key could fill it with no bot check and no size limit. Migration
 * 036 takes that insert away; this function, with the service role, is now
 * the only way in. Guarded like checkout and order lookup (migration 035): a
 * Turnstile token, and limits per address and per email.
 *
 * The honeypot and the "too fast to be human" check stay in the browser.
 * They answer a bot as if it had succeeded, which only works if the bot never
 * reaches this function to find out otherwise.
 */

const MAX_NAME = 200;
const MAX_EMAIL = 254;
const MAX_PHONE = 30;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 5000;
const MAX_SOURCE_PAGE = 200;
const MAX_TOKEN_LENGTH = 2048;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TURNSTILE_ACTION = "inquiry";
const TEN_MINUTES = 10 * 60;
const HOUR = 60 * 60;

type InquiryRequest = {
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  consent: boolean;
  sourcePage: string | null;
  turnstileToken: string | null;
};

type Invalid = { invalid: string };

/** Trimmed, and cut to length: an over-long optional field is not worth refusing. */
function cleanOptional(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

/** Trimmed. Empty or over-long is refused, so nothing is silently cut off. */
function cleanRequired(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= maxLength ? trimmed : null;
}

function readRequest(body: unknown): InquiryRequest | Invalid {
  if (typeof body !== "object" || body === null) return { invalid: "Missing form details." };
  const fields = body as Record<string, unknown>;

  const name = cleanRequired(fields.name, MAX_NAME);
  if (!name) return { invalid: "Please give your name." };

  const email = cleanRequired(fields.email, MAX_EMAIL);
  if (!email || !EMAIL_PATTERN.test(email)) {
    return { invalid: "Please give a valid email address." };
  }

  const message = cleanRequired(fields.message, MAX_MESSAGE);
  if (!message) return { invalid: `Please keep your message under ${MAX_MESSAGE} characters.` };

  // The form will not send without it ticked; this holds if the form is skipped.
  if (fields.consent !== true) return { invalid: "Please tick the consent box." };

  const token = typeof fields.turnstileToken === "string" &&
      fields.turnstileToken.length <= MAX_TOKEN_LENGTH
    ? fields.turnstileToken
    : null;

  return {
    name,
    email,
    phone: cleanOptional(fields.phone, MAX_PHONE),
    subject: cleanOptional(fields.subject, MAX_SUBJECT),
    message,
    consent: true,
    sourcePage: cleanOptional(fields.sourcePage, MAX_SOURCE_PAGE),
    turnstileToken: token,
  };
}

type Refusal = { status: number; error: string };

/** Null when the inquiry may be filed; otherwise what to answer with. */
async function guard(req: Request, request: InquiryRequest): Promise<Refusal | null> {
  const ip = clientIp(req);
  const limits = [
    {
      scope: "inquiry:email",
      value: request.email.toLowerCase(),
      max: 5,
      windowSeconds: HOUR,
    },
  ];
  if (ip) limits.push({ scope: "inquiry:ip", value: ip, max: 5, windowSeconds: TEN_MINUTES });

  if (!(await withinRateLimits(createAdminClient(), limits))) {
    return { status: 429, error: RATE_LIMITED_MESSAGE };
  }

  const check = await verifyTurnstile(request.turnstileToken, TURNSTILE_ACTION, ip);
  return check.ok ? null : { status: check.status, error: check.error };
}

async function file(request: InquiryRequest): Promise<void> {
  const { error } = await createAdminClient().from("inquiries").insert({
    name: request.name,
    email: request.email,
    phone: request.phone,
    subject: request.subject,
    message: request.message,
    consent: request.consent,
    source_page: request.sourcePage,
  });

  if (error) throw new Error(`Could not save the inquiry: ${error.message}`);
}

Deno.serve(async (req: Request): Promise<Response> => {
  const cors = corsHeadersFor(req);

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405, cors);

  try {
    const request = readRequest(await req.json().catch(() => null));
    if ("invalid" in request) return jsonResponse({ error: request.invalid }, 400, cors);

    const refusal = await guard(req, request);
    if (refusal) return jsonResponse({ error: refusal.error }, refusal.status, cors);

    await file(request);
    return jsonResponse({ received: true }, 200, cors);
  } catch (error) {
    console.error("submit-inquiry failed", error);
    return jsonResponse({ error: "Could not send your message" }, 500, cors);
  }
});
