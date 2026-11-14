import type { NotificationEventType } from '@/types/database-rows';

/**
 * Emails that are not going to arrive (M-010): jobs the worker gave up on
 * after eight tries, and ones that never made it into the queue at all.
 */

export type FailedEmail = {
  id: string;
  eventType: NotificationEventType;
  recipient: string;
  orderId: string | null;
  orderNumber: string | null;
  lastError: string | null;
  createdAt: string;
  /** resend_notification takes order emails only. */
  canResend: boolean;
};

export type EnqueueError = {
  id: string;
  source: string;
  eventType: string | null;
  orderId: string | null;
  detail: string;
  createdAt: string;
};

type JobKey = { orderId: string | null; eventType: string; recipient: string; createdAt: string };

function sameEmail(a: JobKey, b: JobKey): boolean {
  return a.orderId === b.orderId && a.eventType === b.eventType && a.recipient === b.recipient;
}

/**
 * A failed job stays 'failed' after a resend: the resend is a new job. So a
 * failure counts only while no later copy of the same email is queued or sent.
 */
export function stillFailed<T extends JobKey>(failed: T[], later: JobKey[]): T[] {
  return failed.filter(
    job => !later.some(copy => sameEmail(job, copy) && copy.createdAt > job.createdAt),
  );
}
