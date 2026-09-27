/** One hairline tile — a short label over a one-line answer. */
export interface ServiceFact {
  label: string;
  value: string;
}

/**
 * A hairline grid of short facts.
 *
 * Used twice: under the hero, where it answers the three things people scan
 * for before reading anything, and inside a section body where a list of three
 * short items reads better as a row than as bullets. The gap-px-over-border
 * trick gives single-pixel rules between cells without doubling them up.
 *
 * Roots at a div on purpose — the service prose styles direct children only,
 * so a wrapper keeps these cells out of its reach.
 */
export function ServiceTiles({ items }: { items: ServiceFact[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-6 grid gap-px overflow-hidden border border-border/60 bg-border/60 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="bg-card p-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-1.5 text-sm font-bold leading-snug text-foreground">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
