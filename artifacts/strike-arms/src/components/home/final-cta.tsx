import { Link } from "wouter";
import { Phone, ArrowRight } from "lucide-react";

/**
 * Combined homepage — bolder final CTA. Same background treatment and phone
 * number as the live FinalCTASection, but a bigger, plainer headline in Alan's
 * voice and heavier display type. Site tokens.
 */
export function FinalCta() {
  return (
    <section className="relative py-24 md:py-36 overflow-hidden border-t border-border/60">
      <div className="absolute inset-0 bg-card">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-accent/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6 text-center">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-5">
          Come in. Handle the gear.
        </p>
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-foreground mb-6 max-w-5xl mx-auto leading-[0.88]">
          The right setup, from people who actually play.
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Visit the Swords shop or give us a call. No pressure — just good advice.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/store"
            className="group w-full sm:w-auto h-[4.5rem] px-12 inline-flex items-center justify-center gap-2 rounded-none bg-accent text-accent-foreground font-black uppercase tracking-wider text-lg hover:bg-foreground hover:text-background transition-colors shadow-[0_0_30px_hsl(var(--accent)/0.45)]"
          >
            Shop gear
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="tel:+353872736351"
            className="w-full sm:w-auto h-[4.5rem] px-12 inline-flex items-center justify-center rounded-none border-2 border-border bg-background/50 backdrop-blur text-foreground font-black uppercase tracking-wider text-lg hover:border-accent hover:text-accent transition-all"
          >
            <Phone className="w-6 h-6 mr-2" />
            Call +353 87 273 6351
          </a>
        </div>
      </div>
    </section>
  );
}
