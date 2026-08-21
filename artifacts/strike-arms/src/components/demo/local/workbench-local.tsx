import { Link } from "wouter";
import { ArrowRight, Wrench, Cog, Gauge } from "lucide-react";

/**
 * Direction C — the repairs bench, warm and reassuring. Alan's genuine
 * differentiator. Links point to existing service pages; no turnaround times
 * invented.
 */
const SERVICES = [
  { icon: Wrench, label: "Repairs", href: "/services/repairs" },
  { icon: Cog, label: "Gearbox rebuilds", href: "/services/gearbox-rebuilds" },
  { icon: Gauge, label: "Hop-up tuning", href: "/services/hop-up-tuning" },
];

export function WorkbenchLocal() {
  return (
    <section className="bg-[#f4efe6] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg order-2 lg:order-1">
          <img
            src="/images/category-repairs.png"
            alt="An airsoft rifle being serviced on the Strike Arms workbench"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="order-1 lg:order-2">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-[#b06a2c] mb-6">
            The workbench
          </p>
          <h2 className="font-serif text-4xl md:text-5xl text-[#26201b] tracking-tight mb-6">
            Bought it here or not — bring it in.
          </h2>
          <p className="font-sans text-lg text-[#6b6157] leading-relaxed mb-8 max-w-md">
            Alan services and upgrades airsoft guns in-house. Talk it through with
            the person who'll actually do the work — diagnosis first, no mystery
            upgrade list.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            {SERVICES.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.label}
                  href={s.href}
                  className="inline-flex items-center gap-2 rounded-full border border-[#26201b]/20 bg-[#efe8dc] px-4 py-2 font-sans text-sm font-medium text-[#26201b] hover:border-[#b06a2c] hover:text-[#b06a2c] transition-colors"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                  {s.label}
                </Link>
              );
            })}
          </div>

          <Link
            href="/services"
            className="group inline-flex items-center gap-2 rounded-full bg-[#26201b] px-8 py-3.5 font-sans font-semibold text-sm text-[#f4efe6] hover:bg-[#b06a2c] transition-colors"
          >
            Ask Alan about a repair
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
