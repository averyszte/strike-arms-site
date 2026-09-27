import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { loadErrorMessage } from '@/lib/load-error-message';

/**
 * What an admin screen shows when its data could not be read.
 *
 * Before this, a failed read fell through to the empty state, so a dropped
 * connection said "No orders found" and a dashboard showed EUR 0 revenue. An
 * empty list and a list that never arrived must never look the same.
 */

type AdminLoadErrorProps = {
  /** What failed to load, as it would follow "Could not load": "the orders". */
  what: string;
  error: unknown;
  isRetrying?: boolean;
  onRetry: () => void;
};

export function AdminLoadError({ what, error, isRetrying = false, onRetry }: AdminLoadErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-start"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-medium text-foreground">Could not load {what}</p>
        <p className="text-sm text-muted-foreground">
          The request failed, so nothing is shown rather than a list that might be wrong. Check
          the connection and try again.
        </p>
        <p className="break-words text-xs text-muted-foreground">{loadErrorMessage(error)}</p>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isRetrying}
        onClick={onRetry}
        className="shrink-0"
      >
        <RefreshCw
          className={`mr-1.5 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`}
          aria-hidden="true"
        />
        Try again
      </Button>
    </div>
  );
}
