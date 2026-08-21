import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

/**
 * Direction A — playstyles reframed as "mission profiles" (briefing cards).
 * Uses the existing playstyle scene photography, but as full-bleed dossier
 * cards with mono labels — distinct from the live ShopByLoadout tab UI.
 */
const PROFILES = [
  { tag: "PRO-01", name: "First Loadout", scene: "Starting out", img: "/images/playstyles/beginner-setup.webp", href: "/guides/first-airsoft-gun" },
  { tag: "PRO-02", name: "CQB", scene: "Close quarters", img: "/images/playstyles/cqb.webp", href: "/guides/loadout-cqb" },
  { tag: "PRO-03", name: "Woodland", scene: "Outdoor skirmish", img: "/images/playstyles/mil-sim.webp", href: "/guides/loadout-woodland" },
  { tag: "PRO-04", name: "Marksman", scene: "Long range", img: "/images/playstyles/sniper.webp", href: "/guides/loadout-sniper" },
];

export function MissionProfiles() {
  return (
    <section className="bg-[#0f100c] border-y border-[#e9e7dc]/10 text-[#e9e7dc] py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10">
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#ff5a1f] mb-3">
            02 — Mission profiles
          </p>
          <h2 className="font-sans font-black uppercase text-3xl md:text-5xl tracking-tight max-w-2xl">
            Kit by how you play
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROFILES.map((p) => (
            <Link
              key={p.tag}
              href={p.href}
              className="group relative aspect-[3/4] overflow-hidden border border-[#e9e7dc]/10"
            >
              <img
                src={p.img}
                alt={p.name}
                className="absolute inset-0 w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c09] via-[#0b0c09]/20 to-transparent" />
              <div className="absolute top-3 left-3 font-mono text-[10px] tracking-[0.2em] text-[#ff5a1f]">
                {p.tag}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#c7c5b8] mb-1">
                  {p.scene}
                </p>
                <div className="flex items-center justify-between">
                  <h3 className="font-sans font-black uppercase text-lg leading-none">
                    {p.name}
                  </h3>
                  <ArrowUpRight className="w-5 h-5 text-[#ff5a1f] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
