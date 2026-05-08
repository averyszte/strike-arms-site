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
    <div className="h-8 bg-[#0d0d0d] border-b border-border/40 flex items-center overflow-hidden">
      {/* Brand marquee — left side */}
      <div className="flex-1 overflow-hidden relative">
        <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
          {[...brands, ...brands].map((brand, i) => (
            <span
              key={i}
              className="text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground/70 hover:text-muted-foreground transition-colors cursor-default shrink-0"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

      {/* Utility links — right side */}
      <div className="hidden md:flex items-center gap-0 border-l border-border/30 pl-4 mr-4 shrink-0">
        {utilityLinks.map((link, i) => (
          <span key={link.name} className="flex items-center">
            {i > 0 && <span className="text-border/60 text-[10px] mx-2">|</span>}
            <Link
              href={link.href}
              className="text-[10px] font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          </span>
        ))}
      </div>
    </div>
  );
}
