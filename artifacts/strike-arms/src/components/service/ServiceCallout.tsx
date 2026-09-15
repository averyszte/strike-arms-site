import { AlertTriangle, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type ServiceCalloutTone = 'warning' | 'note';

const TONES: Record<ServiceCalloutTone, { icon: LucideIcon; edge: string; text: string }> = {
  warning: { icon: AlertTriangle, edge: 'border-l-destructive', text: 'text-destructive' },
  note: { icon: Info, edge: 'border-l-accent', text: 'text-accent' },
};

export interface ServiceCalloutProps {
  tone?: ServiceCalloutTone;
  title: string;
  children: ReactNode;
}

/**
 * A bordered aside for the one thing in a section that must not be skimmed —
 * the symptoms that mean stop shooting, the habit that causes the damage.
 *
 * Tones are limited to two on purpose. A page with four colours of box has no
 * emphasis left, and the palette only has one warning colour that means
 * anything.
 */
export function ServiceCallout({ tone = 'note', title, children }: ServiceCalloutProps) {
  const { icon: Icon, edge, text } = TONES[tone];

  return (
    <div className={`mt-6 rounded-sm border border-l-2 border-border bg-secondary/40 p-5 ${edge}`}>
      <p className={`flex items-center gap-2 text-sm font-semibold ${text}`}>
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {title}
      </p>
      <div className="mt-3 text-sm leading-relaxed text-muted-foreground [&>p]:mt-3 [&>p:first-child]:mt-0 [&>ul]:mt-3 [&>ul]:list-disc [&>ul]:space-y-1.5 [&>ul]:pl-5">
        {children}
      </div>
    </div>
  );
}
