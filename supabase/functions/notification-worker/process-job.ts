import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { MissingSecretError, optionalEnv, requireEnv } from "../_shared/env.ts";
import { EmailSendError, sendEmail } from "../_shared/resend.ts";
import { PermanentJobError, renderJob, type NotificationJob } from "./build-email.ts";

/**
 * One claimed job, from render to its final row state. Every job ends in
 * exactly one outcome, reported back per job so a failure is visible in the
 * pg_net response log rather than only in the function logs.
 *
 *   sent      Resend took it.
 *   retrying  Something that can pass (a timeout, a 429 or 5xx, a database
 *             hiccup). complete_notification_job backs it off.
 *   failed    It cannot work as it is (a 4xx such as a bad address, an
 *             unknown type), or it has used its eight attempts. Shown to the
 *             admin as a failed email.
 *   skipped   Nothing should be sent (the order moved on). See skipJob.
 *   deferred  Not tried, because Resend is down or a secret is missing for
 *             every job. Backed off like a retry.
 */

export type JobOutcome = "sent" | "retrying" | "failed" | "skipped" | "deferred";

export type JobReport = {
  id: string;
  event_type: string;
  outcome: JobOutcome;
  http_status?: number | null;
};

/** The last attempt claim_notification_jobs allows (046). */
const MAX_ATTEMPTS = 8;
const ERROR_LIMIT = 1000;

function messageOf(error: unknown): string {
  return (error instanceof Error ? error.message : String(error)).slice(0, ERROR_LIMIT);
}

/** Fails a job now, without the remaining retries. */
async function failJob(admin: SupabaseClient, job: NotificationJob, reason: string): Promise<void> {
  const { error } = await admin
    .from("notification_jobs")
    .update({ status: "failed", last_error: reason.slice(0, ERROR_LIMIT) })
    .eq("id", job.id)
    .eq("status", "pending");
  // If this does not land, the job is retried and fails the same way.
  if (error) console.error(`notification ${job.id} not marked failed: ${error.message}`);
}

/** Retries a job later, or fails it on its last attempt (046 decides). */
async function retryJob(admin: SupabaseClient, job: NotificationJob, reason: string): Promise<JobOutcome> {
  const { error } = await admin.rpc("complete_notification_job", {
    p_job_id: job.id,
    p_error: reason.slice(0, ERROR_LIMIT),
  });
  // The lease runs out and the job is claimed again.
  if (error) console.error(`notification ${job.id} not backed off: ${error.message}`);
  return job.attempt_count >= MAX_ATTEMPTS ? "failed" : "retrying";
}

/**
 * Nothing to send. A job on its first try is withdrawn, as the 042 trigger
 * would have done had it fired in time, so the order's history shows no
 * email. One already tried, or an admin re-send, is kept as failed with the
 * reason, so the admin sees why the customer heard nothing.
 */
async function skipJob(admin: SupabaseClient, job: NotificationJob, reason: string): Promise<void> {
  if (job.attempt_count > 1 || job.event_type !== "customer.status_changed") {
    await failJob(admin, job, reason);
    return;
  }
  const { error } = await admin
    .from("notification_jobs")
    .delete()
    .eq("id", job.id)
    .eq("status", "pending");
  if (error) {
    console.error(`notification ${job.id} not withdrawn: ${error.message}`);
    await failJob(admin, job, reason);
  }
}

/**
 * "owner" is resolved here so the address lives in a secret, not in rows.
 * The daily health digest is technical, so it goes to whoever runs the site
 * (HEALTH_EMAIL), never to the shop owner. If HEALTH_EMAIL is not set the
 * digest fails on its own rather than falling back to the owner, and other
 * emails are unaffected.
 */
function resolveRecipient(job: NotificationJob): string {
  if (job.event_type === "owner.health_digest") {
    const health = optionalEnv("HEALTH_EMAIL");
    if (!health) throw new PermanentJobError("HEALTH_EMAIL is not set; health digest not sent");
    return health;
  }
  return job.recipient === "owner" ? requireEnv("OWNER_EMAIL") : job.recipient;
}

async function deliver(admin: SupabaseClient, job: NotificationJob, siteUrl: string): Promise<JobOutcome> {
  const rendered = await renderJob(admin, job, siteUrl);
  if (rendered.kind === "skip") {
    await skipJob(admin, job, rendered.reason);
    return "skipped";
  }
  const { email } = rendered;
  const to = resolveRecipient(job);
  await sendEmail({
    to,
    subject: email.subject,
    html: email.html,
    text: email.text,
    // The sending subdomain has no inbox, so without REPLY_TO a customer's
    // reply bounces. Owner alerts keep their own reply-to (the customer).
    replyTo: email.replyTo ?? optionalEnv("REPLY_TO"),
    // The job id, so a job whose lease ran out mid-send is not sent twice.
    idempotencyKey: job.id,
  });
  const { error } = await admin.rpc("complete_notification_job", { p_job_id: job.id, p_error: null });
  // The email went. If the row is not marked sent, the next lease re-sends
  // with the same idempotency key and Resend drops the duplicate.
  if (error) console.error(`notification ${job.id} sent but not completed: ${error.message}`);
  return "sent";
}

/** True when the failure would hit every job, so the rest are not tried. */
export function isBatchWide(error: unknown): boolean {
  return error instanceof MissingSecretError || (error instanceof EmailSendError && error.isServiceWide);
}

export async function processJob(
  admin: SupabaseClient,
  job: NotificationJob,
  siteUrl: string,
): Promise<{ report: JobReport; error?: unknown }> {
  const base = { id: job.id, event_type: job.event_type };
  try {
    return { report: { ...base, outcome: await deliver(admin, job, siteUrl) } };
  } catch (error) {
    const reason = messageOf(error);
    console.error(`notification ${job.id} (${job.event_type}) attempt ${job.attempt_count} failed: ${reason}`);
    const httpStatus = error instanceof EmailSendError ? error.httpStatus : undefined;
    const isPermanent = error instanceof PermanentJobError ||
      (error instanceof EmailSendError && !error.isRetryable);
    if (isPermanent) {
      await failJob(admin, job, reason);
      return { report: { ...base, outcome: "failed", http_status: httpStatus }, error };
    }
    const outcome = await retryJob(admin, job, reason);
    return { report: { ...base, outcome, http_status: httpStatus }, error };
  }
}

/**
 * Backs off a job that was claimed but not tried. The claim already counted
 * the attempt, so a long outage still ends in failed jobs the admin can see
 * and re-send, not in jobs that wait for ever.
 */
export async function deferJob(admin: SupabaseClient, job: NotificationJob, cause: string): Promise<JobReport> {
  const outcome = await retryJob(admin, job, `Not attempted: ${cause}`);
  return { id: job.id, event_type: job.event_type, outcome: outcome === "failed" ? "failed" : "deferred" };
}
