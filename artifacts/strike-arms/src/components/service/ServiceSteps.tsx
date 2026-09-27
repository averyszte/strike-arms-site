import type { ReactNode } from 'react';

export interface ServiceStep {
  title: ReactNode;
  detail?: ReactNode;
}

/**
 * A numbered sequence with a spine running through it.
 *
 * Services describe ordered procedures — diagnose in this order, strip in this
 * order — and the order is the point. A plain <ol> renders those as six
 * indistinguishable lines; the spine makes it read as a process with a
 * beginning and an end. Still an <ol>, so it stays correct without CSS.
 */
export function ServiceSteps({ steps }: { steps: ServiceStep[] }) {
  return (
    <div className="mt-6">
      <ol className="space-y-0">
        {steps.map((step, index) => (
          <li key={index} className="relative flex gap-4 pb-6 last:pb-0">
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-4 top-9 -ml-px w-px bg-border/60"
              />
            )}
            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center bg-accent text-sm font-black text-accent-foreground">
              {index + 1}
            </span>
            <div className="pt-1">
              <p className="font-bold leading-snug text-foreground">{step.title}</p>
              {step.detail && (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
