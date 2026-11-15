import { Link } from "wouter";

const utilityLinks = [
  { name: "Find Us", href: "/contact" },
  { name: "Airsoft Law", href: "/airsoft-law" },
  { name: "Track an Order", href: "/account" },
];

/**
 * The thin bar of utility links above the header, from md up. Below md every
 * link was hidden and the bar was 32px of empty chrome, so it is not shown
 * there at all; the mobile drawer carries the same links. Keep
 * `--header-height` in index.css in step with this bar's height.
 */
export function UtilityBar() {
  return (
    <div className="hidden md:flex h-8 bg-[#0d0d0d] border-b border-border/40 items-center px-4 md:px-6">
      {/* Spacer */}
      <div className="flex-1" />

      {/* Utility links — right side */}
      <nav aria-label="Utility" className="flex items-center gap-0 shrink-0">
        {utilityLinks.map((link, i) => (
          <span key={link.name} className="flex items-center">
            {i > 0 && <span aria-hidden="true" className="text-border/50 text-[11px] mx-2.5">|</span>}
            <Link
              href={link.href}
              className="text-[11px] font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          </span>
        ))}
      </nav>
    </div>
  );
}
