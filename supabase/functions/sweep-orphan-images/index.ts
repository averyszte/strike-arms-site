import { jsonResponse, webhookCorsHeaders } from "../_shared/cors.ts";
import { isServiceRoleCaller } from "../_shared/service-role-caller.ts";
import { createAdminClient } from "../_shared/supabase-admin.ts";

/**
 * Deletes bucket objects that no product has referenced for 30 days.
 *
 * Migration 011 puts a trigger on products that files every dropped image
 * path into orphaned_images. This function is the other half: it drains that
 * queue through the Storage API, which is the only thing that actually
 * removes the underlying object. Deleting a storage.objects row in SQL does
 * not.
 *
 * Grace period (M-018, migration 045): only paths that sweepable_orphaned_images()
 * returns are touched, which means orphaned for 30 days and fewer than five
 * failed attempts. Until then the admin can restore a photo, or put it back
 * on a product.
 *
 * Order of work, so a photo restored mid-run is never deleted: the queue rows
 * are removed first, re-checking the grace period in the same statement, and
 * only the paths that delete actually returned go to Storage. If Storage then
 * fails, those rows are put back with the failure recorded. A crash between
 * the two steps leaves an unreferenced object with no queue row: wasted
 * space, never a lost photo.
 *
 * Maintenance, not a public endpoint. verify_jwt is true in config.toml so the
 * gateway rejects unauthenticated callers, and the service-role check below
 * rejects everything a browser could hold. pg_cron calls it daily (045).
 */

const BUCKET = "product-images";
const BATCH_SIZE = 100;
// Mirrors 045's sweepable_orphaned_images(); the delete re-checks both.
const MAX_ATTEMPTS = 5;
const GRACE_MS = 30 * 24 * 60 * 60 * 1000;

type Admin = ReturnType<typeof createAdminClient>;
/** Mirrors cardVariantOf in src/lib/product-image-variants.ts: a.jpg -> a-card.jpg. */
function cardVariantOf(path: string): string {
  const dot = path.lastIndexOf(".");
  if (dot <= path.lastIndexOf("/")) return path;
  return `${path.slice(0, dot)}-card${path.slice(dot)}`;
}

type QueueRow = { path: string; orphaned_at: string; attempt_count: number };

function fail(code: string, detail: string): Response {
  console.error(`sweep-orphan-images ${code}: ${detail}`);
  return jsonResponse({ error: code }, 500, webhookCorsHeaders);
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/** Takes the paths off the queue, but only those still past their grace period. */
async function dequeue(admin: Admin, paths: string[], cutoff: string) {
  return await admin
    .from("orphaned_images")
    .delete()
    .in("path", paths)
    .lt("orphaned_at", cutoff)
    .lt("attempt_count", MAX_ATTEMPTS)
    .select("path, orphaned_at, attempt_count");
}

/** Puts rows back after a Storage failure, one attempt further on. */
async function requeue(admin: Admin, rows: QueueRow[], reason: string): Promise<void> {
  const { error } = await admin.from("orphaned_images").upsert(
    rows.map((row) => ({
      path: row.path,
      orphaned_at: row.orphaned_at,
      attempt_count: row.attempt_count + 1,
      last_error: reason.slice(0, 500),
    })),
    { onConflict: "path" },
  );
  if (error) console.error(`sweep-orphan-images could not requeue: ${error.message}`);
}

async function sweepableCount(admin: Admin, cutoff: string): Promise<number> {
  const { count } = await admin
    .from("orphaned_images")
    .select("path", { count: "exact", head: true })
    .lt("orphaned_at", cutoff)
    .lt("attempt_count", MAX_ATTEMPTS);
  return count ?? 0;
}

async function sweep(admin: Admin): Promise<Response> {
  const cutoff = new Date(Date.now() - GRACE_MS).toISOString();

  const { data: due, error: listError } = await admin.rpc("sweepable_orphaned_images", {
    p_limit: BATCH_SIZE,
  });
  if (listError) return fail("list_failed", listError.message);
  const candidates = isStringList(due) ? due : [];
  if (candidates.length === 0) {
    return jsonResponse({ swept: 0, remaining: 0 }, 200, webhookCorsHeaders);
  }

  const { data: claimed, error: claimError } = await dequeue(admin, candidates, cutoff);
  if (claimError) return fail("dequeue_failed", claimError.message);
  const rows = (claimed ?? []) as QueueRow[];
  if (rows.length === 0) {
    return jsonResponse({ swept: 0, remaining: await sweepableCount(admin, cutoff) }, 200, webhookCorsHeaders);
  }

  // remove() succeeds for objects that are already gone, so an error here
  // means the Storage API itself is unhappy and the next run should retry.
  // Each photo's card-sized copy (M-044) goes with it; photos uploaded
  // before card copies existed simply have nothing at that path.
  const objects = rows.flatMap((row) => [row.path, cardVariantOf(row.path)]);
  const { error: removeError } = await admin.storage.from(BUCKET).remove(objects);
  if (removeError) {
    await requeue(admin, rows, removeError.message);
    return fail("storage_remove_failed", removeError.message);
  }

  return jsonResponse(
    { swept: rows.length, remaining: await sweepableCount(admin, cutoff) },
    200,
    webhookCorsHeaders,
  );
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

  try {
    return await sweep(createAdminClient());
  } catch (error) {
    return fail("unexpected", error instanceof Error ? error.message : String(error));
  }
});
