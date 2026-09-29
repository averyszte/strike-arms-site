import { jsonResponse, webhookCorsHeaders } from "../_shared/cors.ts";
import { requireEnv } from "../_shared/env.ts";
import { sendEmail } from "../_shared/resend.ts";
import { isServiceRoleCaller } from "../_shared/service-role-caller.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import { buildEmail, type NotificationJob } from "./build-email.ts";
import { loadEmailOrder } from "./load-order.ts";

/**
 * Sends the order emails queued by migration 030.
 *
 * The trigger on orders writes a job in the same transaction as the change
 * that caused it, so an email is never promised for a change that rolled
 * back. pg_cron calls this function once a minute, and only when a job is
 * due. Each job is claimed with a lease (claim_notification_jobs), sent, and
 * then completed or backed off (complete_notification_job). The job id is the
 * Resend idempotency key, so a job whose lease ran out mid-send is not sent
 * twice.
 *
 * Maintenance, not a public endpoint: verify_jwt is on and the caller must
 * hold the service role.
 */

const BATCH_SIZE = 10;

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

async function sendJob(admin: SupabaseAdmin, job: NotificationJob): Promise<void> {
  const order = await loadEmailOrder(admin, job.order_id);
  const email = buildEmail(job, order, requireEnv("SITE_URL").replace(/\/$/, ""));
  // "owner" is resolved here so the address lives in one secret, not in rows.
  const to = job.recipient === "owner" ? requireEnv("OWNER_EMAIL") : job.recipient;
  await sendEmail({
    to,
    subject: email.subject,
    html: email.html,
    text: email.text,
    replyTo: job.recipient === "owner" ? order.customerEmail ?? undefined : undefined,
    idempotencyKey: job.id,
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: webhookCorsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405, webhookCorsHeaders);
  }
  if (!isServiceRoleCaller(req)) {
    return jsonResponse({ error: "Forbidden" }, 403, webhookCorsHeaders);
  }

  const admin = createAdminClient();
  const { data: jobs, error: claimError } = await admin.rpc("claim_notification_jobs", {
    p_limit: BATCH_SIZE,
  });
  if (claimError) {
    return jsonResponse({ error: claimError.message }, 500, webhookCorsHeaders);
  }

  let sent = 0;
  let failed = 0;
  for (const job of (jobs ?? []) as NotificationJob[]) {
    let sendError: string | null = null;
    try {
      await sendJob(admin, job);
      sent += 1;
    } catch (error) {
      sendError = error instanceof Error ? error.message : String(error);
      failed += 1;
      console.error(`notification ${job.id} (${job.event_type}) failed: ${sendError}`);
    }

    const { error: completeError } = await admin.rpc("complete_notification_job", {
      p_job_id: job.id,
      p_error: sendError,
    });
    // The lease expires and the job is claimed again; the idempotency key
    // stops a sent email going twice.
    if (completeError) {
      console.error(`notification ${job.id} not completed: ${completeError.message}`);
    }
  }

  return jsonResponse({ sent, failed }, 200, webhookCorsHeaders);
});
