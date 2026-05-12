import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { Wrench, Zap, ArrowRight } from 'lucide-react';
import { SiteLayout } from '@/components/SiteLayout';

export default function ServicesHub() {
  return (
    <SiteLayout>
      <Helmet>
        <title>Services — Strike Arms Airsoft Dublin</title>
        <meta
          name="description"
          content="Expert airsoft repair and upgrade services at Strike Arms Dublin. Book your AEG, GBB, or sniper rifle in for a professional service."
        />
        <link rel="canonical" href="https://strikearms.ie/services" />
      </Helmet>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-16">
        <div className="max-w-2xl mb-12">
          <h1 className="text-4xl font-black tracking-tight text-foreground mb-4">
            Services
          </h1>
          <p className="text-lg text-muted-foreground">
            Our workshop handles everything from basic servicing to full custom builds.
            Drop in or book ahead.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
          <Link
            href="/services/repairs"
            className="group block rounded-lg border border-border/60 bg-card p-6 hover:border-accent/60 transition-colors"
          >
            <Wrench className="w-8 h-8 text-accent mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
              Repair Services
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              AEG, GBB, and sniper rifle repairs. Diagnose, strip, and rebuild by our technicians.
            </p>
            <span className="flex items-center gap-1 text-sm text-accent font-medium">
              Book a repair <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <Link
            href="/services/upgrades"
            className="group block rounded-lg border border-border/60 bg-card p-6 hover:border-accent/60 transition-colors"
          >
            <Zap className="w-8 h-8 text-accent mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
              Upgrade Services
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              FPS tuning, trigger response, hop-up setup, and full custom builds to your spec.
            </p>
            <span className="flex items-center gap-1 text-sm text-accent font-medium">
              Get an upgrade <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            Prefer to call?{' '}
            <a
              href="tel:+353872736351"
              className="text-foreground hover:text-accent transition-colors"
            >
              +353 87 273 6351
            </a>
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
