import { jsonResponse, webhookCorsHeaders } from "../_shared/cors.ts";
import { missingEnv } from "../_shared/env.ts";
import { isServiceRoleCaller } from "../_shared/service-role-caller.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";
import type { NotificationJob } from "./build-email.ts";
import { deferJob, isBatchWide, processJob, type JobOutcome, type JobReport } from "./process-job.ts";

/**
 * Sends the emails queued by migrations 030 (orders), 039 (contact and
 * quote forms) and 048 (the daily health digest).
 *
 * The trigger on orders writes a job in the same transaction as the change
 * that caused it, so an email is never promised for a change that rolled
 * back. pg_cron calls this function once a minute, and only when a job is
 * due. Each job is claimed with a lease (claim_notification_jobs), sent, and
 * then completed, backed off or failed (process-job.ts).
 *
 * The response lists each job's outcome but no addresses or raw errors:
 * pg_net keeps response bodies in a table. The detail goes to the function
 * logs.
 *
 * Maintenance, not a public endpoint: verify_jwt is on and the caller must
 * hold the service role.
 */

const BATCH_SIZE = 10;

// Checked before claiming, so a missing secret does not burn an attempt
// on every queued job. REPLY_TO is optional.
const REQUIRED_SECRETS = ["SITE_URL", "RESEND_API_KEY", "EMAIL_FROM", "OWNER_EMAIL"] as const;

type Tally = Record<JobOutcome, number>;

function tally(reports: JobReport[]): Tally {
  const counts: Tally = { sent: 0, retrying: 0, failed: 0, skipped: 0, deferred: 0 };
  for (const report of reports) counts[report.outcome] += 1;
  return counts;
}

async function runBatch(
  admin: ReturnType<typeof createAdminClient>,
  jobs: NotificationJob[],
  siteUrl: string,
): Promise<JobReport[]> {
  const reports: JobReport[] = [];
  let stopCause: string | null = null;
  for (const job of jobs) {
    if (stopCause) {
      reports.push(await deferJob(admin, job, stopCause));
      continue;
    }
    const { report, error } = await processJob(admin, job, siteUrl);
    reports.push(report);
    if (isBatchWide(error)) {
      stopCause = `the email service failed for job ${job.id} (HTTP ${report.http_status ?? "none"})`;
    }
  }
  return reports;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: webhookCorsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405, webhookCorsHeaders);
  }
  if (!(await isServiceRoleCaller(req))) {
    return jsonResponse({ error: "Forbidden" }, 403, webhookCorsHeaders);
  }

  const missing = missingEnv(REQUIRED_SECRETS);
  if (missing.length > 0) {
    // Secret names only, never values. Redeploy after setting them.
    console.error(`notification-worker is missing secrets: ${missing.join(", ")}`);
    return jsonResponse({ error: "misconfigured", missing }, 500, webhookCorsHeaders);
  }

  const admin = createAdminClient();
  const { data, error: claimError } = await admin.rpc("claim_notification_jobs", {
    p_limit: BATCH_SIZE,
  });
  if (claimError) {
    console.error(`notification-worker could not claim jobs: ${claimError.message}`);
    return jsonResponse({ error: "claim_failed" }, 500, webhookCorsHeaders);
  }

  const siteUrl = (Deno.env.get("SITE_URL") ?? "").replace(/\/$/, "");
  const reports = await runBatch(admin, (data ?? []) as NotificationJob[], siteUrl);
  return jsonResponse({ ...tally(reports), jobs: reports }, 200, webhookCorsHeaders);
});
