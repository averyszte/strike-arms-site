import { useState } from 'react';
import { Link } from 'wouter';
import { AlertTriangle, CheckCircle2, ChevronRight, OctagonAlert } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buildOperationalAlerts } from '@/lib/admin-alerts';
import type { Order } from '@/types/order';
import type { Product } from '@/types/product';

/**
 * The one thing on this dashboard that reports a problem without anyone going
 * looking for it — so every row is a link to the screen where it gets fixed.
 */

interface Props {
  orders: Order[];
  products: Product[];
  newInquiryCount: number;
}

export function OperationalAlertsCard({ orders, products, newInquiryCount }: Props) {
  // Read once on mount rather than on every render: the clock is not a prop,
  // and a render that returns a different answer each time is the kind of
  // impurity concurrent React is allowed to punish.
  const [now] = useState(() => Date.now());

  const alerts = buildOperationalAlerts({ orders, products, newInquiryCount, now });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Operational Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <p className="text-sm">All clear — nothing waiting on you</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {alerts.map((alert) => {
              const isCritical = alert.severity === 'critical';
              const Icon = isCritical ? OctagonAlert : AlertTriangle;

              return (
                <li key={alert.id}>
                  <Link
                    href={alert.href}
                    className="-mx-2 flex items-start gap-2 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <Icon
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        isCritical ? 'text-destructive' : 'text-yellow-600 dark:text-yellow-500'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-sm ${
                          isCritical ? 'font-medium text-destructive' : 'text-foreground'
                        }`}
                      >
                        {alert.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">{alert.action}</span>
                    </span>
                    <ChevronRight
                      className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
