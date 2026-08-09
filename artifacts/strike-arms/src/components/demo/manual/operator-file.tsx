import { Link } from "wouter";
import { Wrench, Cog, Gauge, ArrowRight } from "lucide-react";

/**
 * Direction A — Alan + the repairs bench merged into one "operator file"
 * dossier (the validation report recommended merging the two, since they tell
 * the same story). Left: photo plate with data overlay. Right: dossier fields +
 * service line. Claims kept as Alan stated; no turnaround times invented.
 */
const SERVICES = [
  { icon: Wrench, label: "Repairs", href: "/services/repairs" },
  { icon: Cog, label: "Gearbox rebuilds", href: "/services/gearbox-rebuilds" },
  { icon: Gauge, label: "Hop-up tuning", href: "/services/hop-up-tuning" },
];

export function OperatorFile() {
  return (
    <section className="bg-[#0b0c09] text-[#e9e7dc] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#ff5a1f] mb-8">
          03 — Operator file
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 border border-[#e9e7dc]/10">
          {/* Photo plate */}
          <div className="relative min-h-[360px] lg:min-h-full border-b lg:border-b-0 lg:border-r border-[#e9e7dc]/10">
            <img
              src="/images/about-store.png"
              alt="Alan at the Strike Arms counter in Swords"
              className="absolute inset-0 w-full h-full object-cover grayscale-[0.3]"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c09]/80 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase text-[#c7c5b8]">
              <span>Subject: Alan</span>
              <span className="text-[#ff5a1f]">Swords, Co. Dublin</span>
            </div>
            <span className="pointer-events-none absolute top-3 left-3 w-5 h-5 border-l border-t border-[#ff5a1f]" />
            <span className="pointer-events-none absolute top-3 right-3 w-5 h-5 border-r border-t border-[#ff5a1f]" />
          </div>

          {/* Dossier */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h2 className="font-sans font-black uppercase text-3xl md:text-4xl tracking-tight mb-6">
              Run by someone
              <br />
              who plays
            </h2>
            <p className="font-mono text-sm text-[#c7c5b8] leading-relaxed mb-8 max-w-md">
              Seventeen years behind the counter and still the one at the
              workbench. Bought it here or not — bring it in, talk it through with
              the person who'll actually fix it. Diagnosis first, no mystery
              upgrade list.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {SERVICES.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.label}
                    href={s.href}
                    className="inline-flex items-center gap-2 border border-[#e9e7dc]/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.1em] text-[#e9e7dc] hover:border-[#ff5a1f] hover:text-[#ff5a1f] transition-colors"
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                    {s.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 bg-[#ff5a1f] px-6 h-11 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0b0c09] hover:bg-[#ff6f3a] transition-colors"
              >
                Ask Alan about a repair
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center h-11 px-2 font-mono text-xs uppercase tracking-[0.2em] text-[#9a9a86] hover:text-[#ff5a1f] transition-colors"
              >
                Read the full story
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
