import { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Order } from '@/types/order';

const HOURS_24_MS = 24 * 60 * 60 * 1000;

interface Props {
  orders: Order[];
}

export function OperationalAlertsCard({ orders }: Props) {
  // Read once on mount rather than on every render: the clock is not a
  // prop, and a render that returns a different answer each time is the
  // kind of impurity concurrent React is allowed to punish.
  const [now] = useState(() => Date.now());

  const failed = orders.filter(o => o.paymentStatus === 'failed');
  const stalePending = orders.filter(
    o =>
      o.paymentStatus === 'paid' &&
      o.fulfillmentStatus === 'pending' &&
      now - new Date(o.createdAt).getTime() > HOURS_24_MS,
  );

  const allClear = failed.length === 0 && stalePending.length === 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Operational Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {allClear ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <p className="text-sm">All clear — no issues detected</p>
          </div>
        ) : (
          <div className="space-y-2">
            {failed.length > 0 && (
              <div className="flex items-start gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-sm">
                  {failed.length} failed payment{failed.length > 1 ? 's' : ''} —{' '}
                  <span className="font-medium">review in Orders</span>
                </p>
              </div>
            )}
            {stalePending.length > 0 && (
              <div className="flex items-start gap-2 text-yellow-600 dark:text-yellow-500">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-sm">
                  {stalePending.length} paid order{stalePending.length > 1 ? 's' : ''} pending
                  &gt;24 h — <span className="font-medium">check fulfillment</span>
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
