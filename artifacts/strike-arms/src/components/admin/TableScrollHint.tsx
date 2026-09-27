import { MoveHorizontal } from 'lucide-react';

/**
 * A line above a wide admin table on phones, where the right-hand columns
 * (status, actions) start off screen and nothing else says they are there.
 */
export function TableScrollHint() {
  return (
    <p className="flex items-center gap-1.5 border-b border-border px-4 py-2 text-xs text-muted-foreground md:hidden">
      <MoveHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
      Swipe the table sideways to see every column.
    </p>
  );
}
