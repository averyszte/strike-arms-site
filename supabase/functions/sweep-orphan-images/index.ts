import { webhookCorsHeaders, jsonResponse } from "../_shared/cors.ts";
import { requireEnv } from "../_shared/env.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";

/**
 * Deletes bucket objects that no product references any more.
 *
 * Migration 011 puts a trigger on products that files every dropped image path
 * into orphaned_images. This function is the other half: it drains that queue
 * through the Storage API, which is the only thing that actually removes the
 * underlying object — deleting a storage.objects row in SQL does not.
 *
 * Maintenance, not a public endpoint. verify_jwt is true in config.toml so the
 * gateway rejects unauthenticated callers, and the service-role check below
 * rejects everything a browser could hold. Intended caller is a scheduled
 * invocation; until one is set up (it belongs with E5's reservation release,
 * which needs the same cron) it can be run by hand after a bulk delete.
 */

const BUCKET = "product-images";

// One batch per invocation. Storage remove() takes a list, so this is a single
// API call regardless of size; the cap exists so a runaway queue cannot make
// one request time out and then retry the same doomed batch forever.
const BATCH_SIZE = 100;

// After this many failures a path is left alone. Something is wrong with it
// specifically, and a queue that retries it every run never reaches the rows
// behind it. The row stays for inspection rather than being dropped.
const MAX_ATTEMPTS = 5;

/**
 * Constant-time-ish comparison. The service-role key is a bearer secret, and
 * an early-exit compare on a secret is a side channel, even if a remote timing
 * attack over an Edge Function is a stretch.
 */
function secretsMatch(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function isServiceRoleCaller(req: Request): boolean {
  const header = req.headers.get("authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;
  return secretsMatch(token, requireEnv("SUPABASE_SERVICE_ROLE_KEY"));
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

  const { data: queued, error: claimError } = await admin
    .from("orphaned_images")
    .select("path")
    .lt("attempt_count", MAX_ATTEMPTS)
    .order("orphaned_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (claimError) {
    return jsonResponse({ error: claimError.message }, 500, webhookCorsHeaders);
  }

  const paths = (queued ?? []).map((row: { path: string }) => row.path);
  if (paths.length === 0) {
    return jsonResponse({ swept: 0, remaining: 0 }, 200, webhookCorsHeaders);
  }

  const { error: removeError } = await admin.storage.from(BUCKET).remove(paths);

  if (removeError) {
    // Record the failure against every path in the batch and leave the rows
    // queued. A path that has already gone is not an error here — remove()
    // succeeds for objects that do not exist — so a real error means the
    // Storage API itself is unhappy and the next run should try again. After
    // MAX_ATTEMPTS the batch stops being claimed and the queue moves on.
    await admin.rpc("bump_orphan_attempts", {
      p_paths: paths,
      p_error: removeError.message,
    });
    return jsonResponse({ error: removeError.message }, 500, webhookCorsHeaders);
  }

  const { error: dequeueError } = await admin
    .from("orphaned_images")
    .delete()
    .in("path", paths);

  if (dequeueError) {
    // The objects are gone but the queue still lists them. The next run will
    // call remove() again on paths that no longer exist, which is a no-op, and
    // then retry this delete. Safe to report and move on.
    return jsonResponse(
      { swept: paths.length, warning: `queue not cleared: ${dequeueError.message}` },
      200,
      webhookCorsHeaders,
    );
  }

  const { count } = await admin
    .from("orphaned_images")
    .select("path", { count: "exact", head: true })
    .lt("attempt_count", MAX_ATTEMPTS);

  return jsonResponse(
    { swept: paths.length, remaining: count ?? 0 },
    200,
    webhookCorsHeaders,
  );
});
