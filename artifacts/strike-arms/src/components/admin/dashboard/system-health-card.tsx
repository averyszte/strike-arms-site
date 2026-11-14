import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, OctagonAlert, AlertTriangle, Activity } from 'lucide-react';

import { AdminLoadError } from '@/components/admin/AdminLoadError';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSystemHealth } from '@/hooks/use-system-health';
import { healthCheckLabel, overallHealth, sortHealthChecks } from '@/lib/system-health';
import type { HealthStatus } from '@/types/database-admin';

const STATUS_ICON = { ok: CheckCircle2, warn: AlertTriangle, fail: OctagonAlert } as const;

const STATUS_COLOUR: Record<HealthStatus, string> = {
  ok: 'text-green-600 dark:text-green-400',
  warn: 'text-yellow-600 dark:text-yellow-500',
  fail: 'text-destructive',
};

const SUMMARY: Record<HealthStatus, string> = {
  ok: 'Everything behind the shop is running',
  warn: 'Something behind the shop needs a look',
  fail: 'Something behind the shop has stopped',
};

/**
 * The background machinery (M-001): cron, the email outbox, the Stripe
 * webhook, stuck payments. The problems here are invisible from the shop
 * floor until a customer rings, so the card opens itself when one appears.
 */
export function SystemHealthCard() {
  const health = useSystemHealth();
  const [isOpenByChoice, setIsOpenByChoice] = useState<boolean | null>(null);

  if (health.isError) {
    return (
      <AdminLoadError
        what="the system health check"
        error={health.error}
        isRetrying={health.isFetching}
        onRetry={() => void health.refetch()}
      />
    );
  }
  if (!health.data) return null;

  const checks = sortHealthChecks(health.data);
  const overall = overallHealth(checks);
  const isOpen = isOpenByChoice ?? overall !== 'ok';
  const Icon = STATUS_ICON[overall];
  const Toggle = isOpen ? ChevronUp : ChevronDown;

  return (
    <Card className={overall === 'fail' ? 'border-destructive/50' : undefined}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Activity className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          System health
        </CardTitle>
        <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpenByChoice(!isOpen)}>
          <Toggle className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">{isOpen ? 'Hide checks' : 'Show checks'}</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className={`flex items-center gap-2 text-sm ${STATUS_COLOUR[overall]}`}>
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          {SUMMARY[overall]}
        </p>
        {isOpen && (
          <ul className="divide-y divide-border">
            {checks.map(check => {
              const CheckIcon = STATUS_ICON[check.status];
              return (
                <li key={check.name} className="flex items-start gap-2 py-2">
                  <CheckIcon className={`mt-0.5 h-4 w-4 shrink-0 ${STATUS_COLOUR[check.status]}`} aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-foreground">{healthCheckLabel(check.name)}</span>
                    <span className="block text-xs text-muted-foreground">{check.detail}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
