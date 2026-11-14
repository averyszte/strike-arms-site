import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

/**
 * The claim protocol around each Stripe event (migration 040, M-002).
 *
 * claim_stripe_event takes the event when it is new, when the last run
 * failed, or when a run has sat in 'processing' for more than two minutes
 * (the isolate died). complete_stripe_event settles it as done or failed.
 *
 * Every result is checked. A claim or a settle that cannot be written is a
 * 500, so Stripe retries and the stale-claim rule recovers the event, rather
 * than a 200 that tells Stripe the event was handled when it was not.
 */

/**
 * - claimed: this run holds the event and must handle it.
 * - done: an earlier run handled it; answer 200 so Stripe stops sending it.
 * - busy: another run holds it, or a dead run's claim has not gone stale
 *   yet. Answer non-2xx, so Stripe sends it again later instead of the
 *   event being dropped as a duplicate.
 */
export type ClaimOutcome = "claimed" | "done" | "busy";

export class EventLogError extends Error {}

export async function claimEvent(
  admin: SupabaseClient,
  eventId: string,
  eventType: string,
): Promise<ClaimOutcome> {
  const { data: claimed, error } = await admin.rpc("claim_stripe_event", {
    p_event_id: eventId,
    p_type: eventType,
  });
  if (error) throw new EventLogError(`claim_stripe_event failed: ${error.message}`);
  if (claimed === true) return "claimed";

  const { data: row, error: readError } = await admin
    .from("stripe_event_log")
    .select("status")
    .eq("id", eventId)
    .maybeSingle();
  if (readError) throw new EventLogError(`Could not read the event log: ${readError.message}`);

  const status = (row as { status?: unknown } | null)?.status;
  return status === "done" ? "done" : "busy";
}

/**
 * Marks the event done (no error) or failed (with the error, kept in the log
 * for the owner). Returns false when the settle could not be written, which
 * the caller answers with a 500.
 */
export async function settleEvent(
  admin: SupabaseClient,
  eventId: string,
  failure: string | null,
): Promise<boolean> {
  const { data, error } = await admin.rpc("complete_stripe_event", {
    p_event_id: eventId,
    p_error: failure,
  });
  if (error) {
    console.error("stripe-webhook could not settle event", eventId, error.message);
    return false;
  }
  if (data !== true) {
    console.error("stripe-webhook found no claim to settle", eventId);
    return false;
  }
  return true;
}

export function errorText(error: unknown): string {
  if (error instanceof Error) return error.message || error.name;
  return String(error);
}
