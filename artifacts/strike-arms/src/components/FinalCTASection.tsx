import { Link } from "wouter";
import { Phone } from "lucide-react";

export function FinalCTASection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden border-t border-border/60">
      {/* Dynamic background effect */}
      <div className="absolute inset-0 bg-card">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-accent/8 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 max-w-4xl mx-auto leading-tight">
          Get the right setup with help from people who actually know the gear.
        </h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Visit us in Dublin or get in touch. No pressure, just good advice.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
          <Link
            href="/store"
            className="w-full sm:w-auto h-14 px-8 inline-flex items-center justify-center rounded-sm bg-accent text-accent-foreground font-bold text-base hover:bg-accent/90 transition-colors shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)]"
          >
            Shop Gear
          </Link>
          <a
            href="tel:+353872736351"
            className="w-full sm:w-auto h-14 px-8 inline-flex items-center justify-center rounded-sm border-2 border-border bg-background/50 backdrop-blur text-foreground font-bold text-base hover:bg-muted hover:border-muted-foreground transition-all"
          >
            <Phone className="w-5 h-5 mr-2" />
            Call +353 87 273 6351
          </a>
        </div>

        <a href="tel:+353872736351" className="inline-block text-accent font-bold hover:underline text-lg md:text-xl">
          +353 87 273 6351
        </a>
      </div>
    </section>
  );
}
