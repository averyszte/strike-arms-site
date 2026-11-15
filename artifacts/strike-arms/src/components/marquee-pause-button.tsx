import { Pause, Play } from "lucide-react";

interface MarqueePauseButtonProps {
  isPaused: boolean;
  onToggle: () => void;
  /** What moves, for the button's name ("brand logos", "reviews"). */
  label: string;
  className?: string;
}

/**
 * Stops and restarts a scrolling marquee (WCAG 2.2.2: moving content that
 * runs for more than five seconds needs a pause). The wrapper it controls
 * carries data-paused, which storefront-motion.css reads.
 */
export function MarqueePauseButton({ isPaused, onToggle, label, className = "" }: MarqueePauseButtonProps) {
  const Icon = isPaused ? Play : Pause;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isPaused}
      aria-label={isPaused ? `Play the moving ${label}` : `Pause the moving ${label}`}
      className={`inline-flex size-9 items-center justify-center bg-background/80 text-foreground hover:text-accent transition-colors motion-reduce:hidden ${className}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
