import { Star, ShieldCheck, MapPin, Package, Wrench } from "lucide-react";

const items = [
  {
    icon: Star,
    title: "4.7 Google Rating",
    sub: "90 verified reviews",
    filled: true,
  },
  {
    icon: ShieldCheck,
    title: "Beginner-Friendly",
    sub: "Easy to shop, easy to start",
    filled: false,
  },
  {
    icon: MapPin,
    title: "Dublin Specialist",
    sub: "Local airsoft store in Dublin",
    filled: false,
  },
  {
    icon: Package,
    title: "Serious Stock",
    sub: "Rifles, gear, BBs, gas & more",
    filled: false,
  },
  {
    icon: Wrench,
    title: "Repairs & Upgrades",
    sub: "Support for maintenance & parts",
    filled: false,
  },
];

export function TrustStrip() {
  return (
    <div
      className="py-8"
      style={{
        background: "#111111",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Icon
                    className={`w-5 h-5 ${
                      item.filled
                        ? "fill-accent text-accent"
                        : "text-accent"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground leading-tight mb-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {item.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
