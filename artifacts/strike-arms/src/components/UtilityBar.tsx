import { Link } from "wouter";

const utilityLinks = [
  { name: "Find a Store", href: "/contact" },
  { name: "Help", href: "/contact" },
  { name: "Airsoft Law", href: "/airsoft-law" },
  { name: "Track an Order", href: "/account" },
];

export function UtilityBar() {
  return (
    <div className="h-8 bg-[#0d0d0d] border-b border-border/40 flex items-center px-4 md:px-6">
      {/* Spacer */}
      <div className="flex-1" />

      {/* Utility links — right side */}
      <div className="hidden md:flex items-center gap-0 shrink-0">
        {utilityLinks.map((link, i) => (
          <span key={link.name} className="flex items-center">
            {i > 0 && <span className="text-border/50 text-[11px] mx-2.5">|</span>}
            <Link
              href={link.href}
              className="text-[11px] font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          </span>
        ))}
      </div>
    </div>
  );
}
