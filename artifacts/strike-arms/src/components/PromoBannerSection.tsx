import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export function PromoBannerSection() {
  return (
    <section className="border-y border-border/60">
      <div className="flex flex-col lg:flex-row">
        {/* Left Panel */}
        <div className="w-full lg:w-5/12 bg-card p-8 md:p-16 lg:p-24 flex flex-col justify-center order-2 lg:order-1 relative overflow-hidden">
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          
          <div className="relative z-10">
            <span className="inline-block text-accent text-xs font-bold tracking-[0.2em] uppercase mb-6">
              New Arrivals
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
              The Starter Kit.<br />
              <span className="text-muted-foreground">Everything you need. Nothing you don't.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-md">
              Purpose-built bundles for players just getting started. Quality AEG, eye protection, battery, and ammo — ready to field.
            </p>
            <Link
              href="/categories/starter-kits"
              className="inline-flex items-center gap-2 group text-sm font-bold uppercase tracking-wider text-foreground hover:text-accent transition-colors"
            >
              Explore Starter Kits
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-7/12 relative min-h-[400px] lg:min-h-[600px] bg-background order-1 lg:order-2">
          {/* Replace right panel image with GIF or looping video when available */}
          <img
            src="/images/promo-banner.png"
            alt="Airsoft Starter Kit"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-background/60" />
        </div>
      </div>
    </section>
  );
}
