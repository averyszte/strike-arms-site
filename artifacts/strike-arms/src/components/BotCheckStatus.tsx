/**
 * The "Checking your browser" line under a form held by the Turnstile check
 * (N-049, N-075). The live region is always in the page and only its text
 * changes, because screen readers seldom announce a region that is mounted
 * with its text already in it. While idle it is visually hidden, so it takes
 * no space.
 */
type BotCheckStatusProps = {
  isChecking: boolean;
  /** Classes for the visible line, such as alignment or spacing. */
  className?: string;
};

const CHECKING_MESSAGE = 'Checking your browser, this takes a second or two…';

export function BotCheckStatus({ isChecking, className = '' }: BotCheckStatusProps) {
  const visibleClass = `text-xs text-muted-foreground ${className}`.trim();
  return (
    <p aria-live="polite" className={isChecking ? visibleClass : 'sr-only'}>
      {isChecking ? CHECKING_MESSAGE : ''}
    </p>
  );
}
