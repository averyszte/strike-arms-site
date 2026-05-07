import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export function AnnotatedRifleSection() {
  const callouts = [
    { top: "25%", left: "30%", label: "Rail System", delay: 0.1 },
    { top: "15%", left: "50%", label: "Optic Mount", delay: 0.2 },
    { top: "35%", left: "80%", label: "Adjustable Stock", delay: 0.3 },
    { top: "65%", left: "45%", label: "High-Capacity Magazine", delay: 0.4 },
    { top: "45%", left: "15%", label: "Precision Barrel", delay: 0.5 },
    { top: "45%", left: "60%", label: "Durable Polymer Body", delay: 0.6 },
  ];

  return (
    <section className="bg-card border-b border-border overflow-hidden">
      <div className="flex flex-col lg:flex-row min-h-[600px] lg:h-[700px]">
        {/* Left: Image with Annotations */}
        <div className="w-full lg:w-[60%] relative bg-background flex items-center justify-center p-8 lg:p-0">
          {/* subtle background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="relative w-full max-w-4xl aspect-video lg:aspect-auto lg:h-full">
            <img
              src="/images/rifle-annotated.png"
              alt="Premium Airsoft AEG Rifle"
              className="w-full h-full object-contain relative z-10"
              loading="lazy"
            />
            
            {/* Desktop Annotations */}
            <div className="hidden md:block absolute inset-0 z-20">
              {callouts.map((callout, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{ top: callout.top, left: callout.left }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: callout.delay, duration: 0.4 }}
                >
                  <div className="relative flex items-center justify-center">
                    <div className="w-3 h-3 bg-accent rounded-full absolute z-10 shadow-[0_0_10px_rgba(234,88,12,0.5)]" />
                    <div className="w-4 h-4 bg-accent/30 rounded-full absolute z-0 animate-ping" />
                    <div className="absolute top-4 left-4 bg-background/95 backdrop-blur border border-border px-3 py-1.5 rounded-sm whitespace-nowrap">
                      <span className="text-xs font-bold text-foreground">{callout.label}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Content */}
        <div className="w-full lg:w-[40%] flex flex-col justify-center p-8 md:p-12 lg:p-16 z-10 bg-card">
          <span className="inline-block text-accent text-xs font-bold tracking-[0.2em] uppercase mb-4">
            Featured Gear
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
            SSP-18 Series
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Built for reliability and performance straight out of the box. No upgrades necessary. Ideal for both indoor CQB and outdoor woodland environments.
          </p>
          
          {/* Mobile-only list of features */}
          <div className="md:hidden flex flex-wrap gap-2 mb-8">
            {callouts.map((callout, i) => (
              <span key={i} className="text-xs font-medium bg-background border border-border px-3 py-1.5 rounded-sm">
                {callout.label}
              </span>
            ))}
          </div>

          <Link
            href="/categories/rifles/ssp-18"
            className="inline-flex h-12 items-center justify-center rounded-sm bg-accent px-8 text-sm font-bold uppercase tracking-wider text-accent-foreground hover:bg-accent/90 transition-colors self-start"
          >
            Explore Featured Rifles
          </Link>
        </div>
      </div>
    </section>
  );
}
