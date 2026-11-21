import { Truck } from 'lucide-react';
import { Link } from 'wouter';

import { useStoreRates } from '@/hooks/use-store-rates';
import { deliveryAnnouncement } from '@/lib/delivery-announcement';
import { IS_DELIVERY_ENABLED } from '@/lib/delivery-availability';

/**
 * The thin strip above the header announcing free delivery. It sits outside
 * the sticky header block, so it scrolls away and `--header-height` is
 * unchanged. Its height is fixed and its text has a fallback, so the page
 * does not jump when the live rates arrive.
 */
export function DeliveryAnnouncementBar() {
  const { data: rates } = useStoreRates();

  if (!IS_DELIVERY_ENABLED) return null;
  const line = deliveryAnnouncement(rates);

  return (
    <Link
      href="/delivery"
      className="flex h-8 items-center justify-center gap-2 bg-accent px-4 text-center text-[11px] font-bold uppercase tracking-wider text-accent-foreground hover:underline md:text-xs"
    >
      <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate sm:hidden">{line.short}</span>
      <span className="hidden truncate sm:inline">{line.full}</span>
    </Link>
  );
}
