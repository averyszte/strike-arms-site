import { button, layout, note, panel, paragraph, type RenderedEmail } from "./layout.ts";

/**
 * To Alan, at most once a day, when one of the shop's health checks
 * (system_health_checks, migration 048) is not ok. Written for the shop
 * owner, not a developer: each check gets a plain name and a plain next
 * step, and the technical detail sits underneath for whoever fixes it.
 */

export type HealthCheck = { check: string; status: "warn" | "fail"; detail: string };
export type HealthDigest = { checks: HealthCheck[]; checkedAt: string | null };

type CheckCopy = { title: string; advice: string };

const DEVELOPER = "Forward this email to your web developer.";

const CHECK_COPY: Record<string, CheckCopy> = {
  cron_jobs: {
    title: "Scheduled background tasks",
    advice: `Some of the shop's automatic tasks (sending emails, tidying up) are not set up. ${DEVELOPER}`,
  },
  cron_failures: {
    title: "Background tasks failing",
    advice: `Some automatic tasks have been failing. ${DEVELOPER}`,
  },
  vault_key: {
    title: "Background task key",
    advice: `The key the shop uses to run its own background tasks is missing. Emails may stop. ${DEVELOPER}`,
  },
  function_calls: {
    title: "Background task calls",
    advice: `Calls from the database to the shop's background tasks are failing. Emails may be delayed. ${DEVELOPER}`,
  },
  email_queue: {
    title: "Emails waiting or failed",
    advice: `Some emails to customers or to you have not gone out. Check Emails in the admin and resend any that matter. ${DEVELOPER}`,
  },
  email_enqueue_errors: {
    title: "Emails that could not be queued",
    advice: `Some emails could not be prepared at all, so customers may not have heard from you. ${DEVELOPER}`,
  },
  stuck_payments: {
    title: "Payments not confirmed",
    advice: "Some card payments started but were never confirmed. Check Orders in the admin, and the Stripe dashboard, before posting anything.",
  },
  payment_attention: {
    title: "Payments to check",
    advice: "A customer may have paid twice for one order, or a payment came in with no order to match it. Look at the flagged orders in the admin and in the Stripe dashboard, and refund any double payment.",
  },
  stripe_webhook: {
    title: "Messages from Stripe",
    advice: `The shop has not been hearing back from Stripe properly, so paid orders may not show as paid. ${DEVELOPER}`,
  },
  store_settings: {
    title: "Shop settings",
    advice: "The delivery or VAT settings look wrong. Open Settings in the admin and check them.",
  },
  checkout_rate: {
    title: "Unusual number of checkouts",
    advice: "Far more checkouts than usual were started in the last hour. It may be a busy day, or someone misusing the checkout. If orders look normal, there is nothing to do.",
  },
  turnstile_failures: {
    title: "Blocked form submissions",
    advice: "The shop's spam check blocked a lot of form or checkout attempts. This is usually bots and needs nothing from you, unless customers say they cannot get through.",
  },
  orphan_orders: {
    title: "Unfinished orders",
    advice: `Some orders were left half-made by an unfinished checkout. Nothing has been charged. ${DEVELOPER}`,
  },
};

const STATUS_LABEL = { fail: "Needs action", warn: "Worth a look" } as const;

function humanise(name: string): string {
  const words = name.replace(/[_-]+/g, " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : "Unnamed check";
}

function copyFor(check: HealthCheck): CheckCopy {
  return CHECK_COPY[check.check] ?? { title: humanise(check.check), advice: DEVELOPER };
}

function parseCheck(value: unknown): HealthCheck | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  const status = record.status === "fail" ? "fail" : record.status === "warn" ? "warn" : null;
  if (!status || typeof record.check !== "string") return null;
  const detail = typeof record.detail === "string" ? record.detail : "";
  return { check: record.check, status, detail };
}

/** Reads the 048 payload. Null when there is nothing to report. */
export function parseHealthDigest(payload: Record<string, unknown> | null): HealthDigest | null {
  const raw = payload?.checks;
  if (!Array.isArray(raw)) return null;
  const checks = raw.map(parseCheck).filter((check): check is HealthCheck => check !== null);
  if (checks.length === 0) return null;
  // Needs action first, then by name, whatever order the payload came in.
  checks.sort((a, b) => (a.status === b.status ? a.check.localeCompare(b.check) : a.status === "fail" ? -1 : 1));
  const checkedAt = typeof payload?.checked_at === "string" ? payload.checked_at : null;
  return { checks, checkedAt };
}

function formatCheckedAt(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-IE", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Dublin",
  }).format(date);
}

function subjectFor(digest: HealthDigest): string {
  const failing = digest.checks.filter((check) => check.status === "fail").length;
  if (failing > 0) {
    return `Shop health: ${failing} ${failing === 1 ? "thing needs" : "things need"} action`;
  }
  const count = digest.checks.length;
  return `Shop health: ${count} ${count === 1 ? "thing is" : "things are"} worth a look`;
}

function checkLines(check: HealthCheck): { title: string; lines: string[] } {
  const copy = copyFor(check);
  return {
    title: `${STATUS_LABEL[check.status]}: ${copy.title}`,
    lines: [copy.advice, ...(check.detail ? [`Technical detail: ${check.detail}`] : [])],
  };
}

export function healthDigestEmail(digest: HealthDigest, adminUrl: string): RenderedEmail {
  const when = formatCheckedAt(digest.checkedAt);
  const intro = "The shop checks itself every morning. Most days everything is fine and you hear nothing. " +
    "Today some things need your attention.";
  const footnote = "If a check says to forward this to your web developer, send them the whole email. " +
    "The technical detail is for them.";
  const blocks = digest.checks.map(checkLines);

  const html = layout({
    preheader: subjectFor(digest),
    eyebrow: "Daily shop check",
    heading: "Some things need a look",
    body:
      paragraph(intro) +
      (when ? note(`Checked ${when}.`) : "") +
      blocks.map((block) => panel(block.title, block.lines)).join("") +
      button("Open the admin", adminUrl) +
      note(footnote),
  });

  return {
    subject: subjectFor(digest),
    html,
    text: [
      intro,
      when ? `Checked ${when}.` : "",
      ...blocks.map((block) => [block.title, ...block.lines].join("\n")),
      `Open the admin: ${adminUrl}`,
      footnote,
    ].filter(Boolean).join("\n\n"),
  };
}
