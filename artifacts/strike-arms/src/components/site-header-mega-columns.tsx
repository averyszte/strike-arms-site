import { Link } from "wouter";

import { isAppRoute } from "@/lib/is-app-route";
import type { MegaColumn } from "@/types/navigation";

type Props = {
  columns: MegaColumn[];
  /** Closes the menu once a link is followed. */
  onNavigate: () => void;
};

/** The link columns inside one desktop mega menu. */
export function SiteHeaderMegaColumns({ columns, onNavigate }: Props) {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8 grid grid-cols-3 gap-8">
      {columns.map((col) => (
        <div key={col.title}>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent mb-4">
            {col.title}
          </p>
          <ul className="space-y-2.5">
            {col.links.map((link) => (
              <li key={link.label}>
                {isAppRoute(link.href) ? (
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    onClick={onNavigate}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
