import { Shield, Users, Tag, Headphones, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function WhyBuySection() {
  return (
    <section className="bg-background border-y border-border/60">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">

        {/* Mobile: Image top. Desktop: Image left */}
        <div className="relative h-[400px] lg:h-auto border-b lg:border-b-0 lg:border-r border-border/60">
          <img
            src="/images/why-buy.png"
            alt="Strike Arms Store Interior"
            className="absolute inset-0 w-full h-full object-cover grayscale-[0.15]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-transparent" />
        </div>

        {/* Content — slightly elevated card tone */}
        <div className="flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-card">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-12">
            Why Buy From <span className="text-accent">Strike Arms?</span>
          </h2>

          <div className="flex flex-col gap-8 md:gap-10">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-sm bg-muted border border-border/60 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">Expert Gear Advice</h3>
                <p className="text-muted-foreground">We have tested what we sell. Get real recommendations from people who actually play.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-sm bg-muted border border-border/60 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">Beginner-Friendly</h3>
                <p className="text-muted-foreground">Never bought airsoft gear before? We will walk you through everything you need, and nothing you don't.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-sm bg-muted border border-border/60 flex items-center justify-center shrink-0">
                <Tag className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">Fair Pricing</h3>
                <p className="text-muted-foreground">No inflated markups. Competitive prices on quality tactical gear and replicas.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-sm bg-muted border border-border/60 flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">After-Sale Support</h3>
                <p className="text-muted-foreground">Got an issue after purchase? Need an upgrade installed? We are here to help.</p>
              </div>
            </div>
          </div>

          <Link
            href="/shop"
            className="mt-10 inline-flex items-center gap-2 h-12 px-7 rounded-sm bg-accent text-accent-foreground font-bold text-sm hover:bg-accent/90 transition-colors self-start"
          >
            See Our Collection
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
      </div>
    </section>
  );
}
