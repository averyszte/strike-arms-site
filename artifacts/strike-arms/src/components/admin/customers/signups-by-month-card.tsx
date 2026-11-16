import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MonthlySignups } from '@/types/admin-customer';

interface Props {
  rows: MonthlySignups[];
}

/** Plain bars rather than recharts, so this page does not load the chart chunk. */
export function SignupsByMonthCard({ rows }: Props) {
  const highest = Math.max(1, ...rows.map((row) => row.count));
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Sign-ups by Month</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2.5">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center gap-3 text-sm">
              <span className="w-16 shrink-0 text-xs text-muted-foreground">{row.label}</span>
              <div className="h-2.5 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${(row.count / highest) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right font-semibold tabular-nums">{row.count}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
