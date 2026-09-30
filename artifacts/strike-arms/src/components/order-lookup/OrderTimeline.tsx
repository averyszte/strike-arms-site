import {
  Check,
  ClipboardCheck,
  Package,
  PackageCheck,
  ShoppingBag,
  Store,
  Truck,
  type LucideIcon,
} from 'lucide-react';

import { formatOrderDate } from '@/lib/order-lookup-display';
import type { TimelineStep, TimelineStepState } from '@/lib/order-timeline';
import type { FulfillmentStatus } from '@/types/database-rows';

const STEP_ICONS: Record<FulfillmentStatus, LucideIcon> = {
  pending: ClipboardCheck,
  packed: Package,
  shipped: Truck,
  delivered: PackageCheck,
  ready_for_pickup: Store,
  collected: ShoppingBag,
  cancelled: ClipboardCheck,
};

const DOT_STYLES: Record<TimelineStepState, string> = {
  done: 'border-accent bg-accent text-accent-foreground',
  current: 'border-accent bg-background text-accent',
  upcoming: 'border-border bg-background text-muted-foreground',
};

const STATE_TEXT: Record<TimelineStepState, string> = {
  done: ', done',
  current: ', current step',
  upcoming: ', to come',
};

/**
 * The line of steps for an order. Vertical on phones, across the card from
 * md up. The connector after a step is filled once that step is done.
 */
export function OrderTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="flex flex-col md:flex-row" aria-label="Order progress">
      {steps.map((step, index) => (
        <TimelineItem key={step.status} step={step} isLast={index === steps.length - 1} />
      ))}
    </ol>
  );
}

function TimelineItem({ step, isLast }: { step: TimelineStep; isLast: boolean }) {
  const Icon = step.state === 'done' ? Check : STEP_ICONS[step.status];
  const date = step.at ? formatOrderDate(step.at) : '';

  return (
    <li
      className="relative flex flex-1 gap-3 pb-6 last:pb-0 md:flex-col md:items-center md:gap-2 md:pb-0 md:text-center"
      aria-current={step.state === 'current' ? 'step' : undefined}
    >
      {!isLast && (
        <span
          aria-hidden="true"
          className={`absolute left-4 top-8 bottom-0 w-0.5 md:left-[calc(50%+1rem)] md:right-[calc(-50%+1rem)] md:top-4 md:bottom-auto md:h-0.5 md:w-auto ${
            step.state === 'done' ? 'bg-accent' : 'bg-border'
          }`}
        />
      )}
      <span
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${DOT_STYLES[step.state]}`}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 pt-1 md:px-1 md:pt-0">
        <p
          className={`text-sm font-bold leading-tight ${
            step.state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground'
          }`}
        >
          {step.label}
        </p>
        {date && <p className="mt-0.5 text-xs text-muted-foreground">{date}</p>}
        <span className="sr-only">{STATE_TEXT[step.state]}</span>
      </div>
    </li>
  );
}
