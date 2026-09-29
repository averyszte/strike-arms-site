import type { NotificationEventType, NotificationStatus } from '@/types/database-rows';
import type { OrderEmail } from '@/types/order-email';

export const ORDER_EMAIL_LABELS: Record<NotificationEventType, string> = {
  'customer.order_confirmed': 'Order confirmation',
  'owner.order_paid': 'New order alert',
  'customer.status_changed': 'Status update',
  'customer.refunded': 'Refund notice',
  'owner.low_stock': 'Low stock alert',
};

export const ORDER_EMAIL_STATUS_LABELS: Record<NotificationStatus, string> = {
  pending: 'Queued',
  sent: 'Sent',
  failed: 'Failed',
};

export function orderEmailRecipient(email: OrderEmail): string {
  return email.recipient === 'owner' ? 'the shop' : email.recipient;
}

/** A queued email is still going to be sent; resending it would send two. */
export function canResendOrderEmail(email: OrderEmail): boolean {
  return email.status !== 'pending';
}
