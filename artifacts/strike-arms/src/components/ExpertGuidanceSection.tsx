import { CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export function ExpertGuidanceSection() {
  const points = [
    "First-time buyers and complete beginners",
    "Parents buying for teenagers",
    "Players upgrading their loadout",
    "Help choosing rifles, pistols, BBs, gas, and accessories",
  ];

  return (
    <section className="bg-background border-b border-border">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Image */}
        <div className="relative min-h-[400px] lg:min-h-0 bg-card border-b lg:border-b-0 lg:border-r border-border">
          <img
            src="/images/expert-advice.png"
            alt="Strike Arms expert providing advice"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent lg:bg-gradient-to-r lg:from-background/20 lg:to-background/80" />
        </div>

        {/* Right: Content */}
        <div className="p-8 md:p-16 lg:p-24 flex flex-col justify-center bg-card z-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Not sure what to buy?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Whether you are buying your first gun or upgrading your setup - talk to someone who actually knows the gear.
          </p>

          <ul className="space-y-4 mb-10">
            {points.map((point, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
                <span className="text-foreground font-medium">{point}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-center">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-sm bg-accent px-8 text-sm font-bold text-accent-foreground hover:bg-accent/90 transition-colors"
            >
              Talk to Alan
            </Link>
            <a
              href="tel:+353872736351"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-sm border border-border bg-transparent px-8 text-sm font-bold text-foreground hover:bg-muted transition-colors"
            >
              Call +353 87 273 6351
            </a>
            <Link
              href="/location"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center px-4 text-sm font-bold text-muted-foreground hover:text-accent transition-colors underline-offset-4 hover:underline"
            >
              Visit In Store
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
