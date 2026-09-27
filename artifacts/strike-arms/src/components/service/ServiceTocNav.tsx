import { useActiveSection } from '@/hooks/use-active-section';

export interface ServiceTocItem {
  id: string;
  title: string;
}

/**
 * The sticky "on this page" rail, desktop only.
 *
 * Service pages answer several separate questions — how we diagnose, what it
 * costs, what to do yourself — and a visitor usually arrives with one of them.
 * The rail lets them jump straight to theirs and shows how much page is left,
 * which a wall of prose does not. Hidden below lg, where there is no room for
 * it and the page is short enough to scroll.
 */
export function ServiceTocNav({ items }: { items: ServiceTocItem[] }) {
  const activeId = useActiveSection(items.map((item) => item.id));

  return (
    <nav aria-label="On this page" className="sticky top-28">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
        On this page
      </p>
      <ul className="mt-3 border-l border-border/60">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? 'true' : undefined}
                className={`-ml-px block border-l-2 py-1.5 pl-3 text-sm leading-snug transition-colors ${
                  isActive
                    ? 'border-accent font-bold text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
