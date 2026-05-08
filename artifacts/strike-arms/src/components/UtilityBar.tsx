import { Link } from "wouter";

const brands = [
  "G&G", "Specna Arms", "Tokyo Marui", "ASG", "Vorsk",
  "Nuprol", "Valken", "WE", "Krytac", "ICS",
];

const utilityLinks = [
  { name: "Find a Store", href: "/contact" },
  { name: "Help", href: "/contact" },
  { name: "Airsoft Law", href: "/airsoft-law" },
  { name: "Join Us", href: "/account" },
  { name: "Sign In", href: "/account" },
];

export function UtilityBar() {
  return (
    <div className="h-8 bg-[#0d0d0d] border-b border-border/40 flex items-center px-4 md:px-6">
      {/* Brand marquee — constrained left portion */}
      <div className="w-[340px] overflow-hidden relative shrink-0 hidden md:block">
        <div className="flex items-center gap-7 animate-marquee whitespace-nowrap">
          {[...brands, ...brands].map((brand, i) => (
            <span
              key={i}
              className="text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground/60 cursor-default shrink-0"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

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
