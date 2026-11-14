import type { OperationalAlert } from '@/types/admin-alert';

/** Alerts about messages: enquiries waiting and emails that did not go. */

export function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}

/**
 * Alan gets an email for every enquiry (039), but an email is easy to miss
 * on a busy day. This keeps the unanswered ones on the dashboard until
 * someone marks them read.
 */
export function inquiryAlerts(newInquiryCount: number): OperationalAlert[] {
  if (newInquiryCount <= 0) return [];

  return [
    {
      id: 'new-inquiries',
      severity: 'warning',
      count: newInquiryCount,
      title: `${newInquiryCount} unanswered ${plural(newInquiryCount, 'enquiry', 'enquiries')}`,
      action: 'Read and reply',
      href: '/admin/inquiries',
    },
  ];
}

/**
 * An email the worker gave up on after eight tries, or one that never made
 * it into the queue (M-010). The customer is waiting for something that is
 * not coming.
 */
export function failedEmailAlerts(failedEmailCount: number): OperationalAlert[] {
  if (failedEmailCount <= 0) return [];

  return [
    {
      id: 'failed-emails',
      severity: 'critical',
      count: failedEmailCount,
      title: `${failedEmailCount} ${plural(failedEmailCount, 'email has', 'emails have')} not been sent`,
      action: 'Check the address and send again',
      href: '/admin#failed-emails',
    },
  ];
}
