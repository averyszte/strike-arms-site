import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

import { isAppRoute } from "@/lib/is-app-route";
import type { MegaColumn } from "@/types/navigation";

type Props = {
  columns: MegaColumn[];
  /** The "Shop all" link to the whole section, shown above the columns. */
  allLink?: { label: string; href: string };
  /** Closes the menu once a link is followed. */
  onNavigate: () => void;
};

const LINK_CLASS = "text-sm text-muted-foreground hover:text-foreground transition-colors";

function MegaLink({ href, label, className, onNavigate }: {
  href: string;
  label: React.ReactNode;
  className: string;
  onNavigate: () => void;
}) {
  return isAppRoute(href) ? (
    <Link href={href} onClick={onNavigate} className={className}>{label}</Link>
  ) : (
    <a href={href} onClick={onNavigate} className={className}>{label}</a>
  );
}

/** The link columns inside one desktop mega menu. */
export function SiteHeaderMegaColumns({ columns, allLink, onNavigate }: Props) {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {allLink && (
        <MegaLink
          href={allLink.href}
          onNavigate={onNavigate}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-accent transition-colors"
          label={<>{allLink.label}<ArrowRight className="w-3.5 h-3.5" aria-hidden="true" /></>}
        />
      )}
      <div className="grid grid-cols-3 gap-8">
        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent mb-4">
              {col.title}
            </p>
            <ul className="space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <MegaLink href={link.href} label={link.label} className={LINK_CLASS} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
