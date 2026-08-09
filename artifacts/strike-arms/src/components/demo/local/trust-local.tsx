import { Clock, Award, MapPin, Wrench } from "lucide-react";

/**
 * Direction C — soft, quiet trust row. Warm palette, hairline dividers, no
 * boxes. Claims kept as Alan stated.
 */
const ITEMS = [
  { icon: Clock, label: "17 years", note: "serving Dublin players" },
  { icon: Award, label: "Oldest in Dublin", note: "still independent" },
  { icon: MapPin, label: "Walk-in shop", note: "Swords, Co. Dublin" },
  { icon: Wrench, label: "In-house repairs", note: "fixed by the people who sell it" },
];

export function TrustLocal() {
  return (
    <section className="bg-[#efe8dc] border-y border-[#26201b]/10">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-start gap-3">
              <Icon className="w-6 h-6 text-[#b06a2c] shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="font-serif text-lg text-[#26201b] leading-tight">
                  {item.label}
                </p>
                <p className="font-sans text-sm text-[#6b6157] mt-0.5">{item.note}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
