import type { NotificationEventType, NotificationStatus } from '@/types/database-rows';

/** One email about an order, as the order sheet lists it (migrations 030, 031). */
export type OrderEmail = {
  id: string;
  eventType: NotificationEventType;
  /** An address, or 'owner' for the shop's own alert. */
  recipient: string;
  status: NotificationStatus;
  attemptCount: number;
  lastError: string | null;
  sentAt: string | null;
  createdAt: string;
};
