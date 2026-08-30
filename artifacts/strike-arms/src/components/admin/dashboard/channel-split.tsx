import { formatPrice } from '@/lib/format-price';
import type { ChannelRevenueRow } from '@/lib/revenue-by-channel';

interface Props {
  rows: ChannelRevenueRow[];
}

/**
 * Where the revenue above it actually came from. Sits under the chart rather
 * than in its own card because it is the same money, read a second way, over
 * the same period the toggle above selected.
 */
export function ChannelSplit({ rows }: Props) {
  if (rows.length === 0) return null;

  return (
    <div className="mt-4 border-t border-border pt-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">By channel, same period</p>
      <ul className="space-y-2.5">
        {rows.map((row) => (
          <li key={row.channel}>
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="tabular-nums">
                <span className="font-medium text-foreground">{formatPrice(row.cents)}</span>
                <span className="ml-2 text-muted-foreground">
                  {row.orderCount} {row.orderCount === 1 ? 'order' : 'orders'}
                </span>
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.round(row.share * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
