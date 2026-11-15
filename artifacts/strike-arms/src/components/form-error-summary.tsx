import { AlertCircle } from 'lucide-react';

/**
 * The line a screen reader hears when a submit finds problems (N-049). It is
 * always in the page so the alert region exists before its text arrives;
 * empty, it takes no space.
 */
export function FormErrorSummary({ count }: { count: number }) {
  return (
    <div role="alert" className="empty:hidden">
      {count > 0 && (
        <p className="flex items-start gap-2 rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {count === 1
            ? 'There is a problem with one field. It is marked below.'
            : `There are problems with ${count} fields. They are marked below.`}
        </p>
      )}
    </div>
  );
}
