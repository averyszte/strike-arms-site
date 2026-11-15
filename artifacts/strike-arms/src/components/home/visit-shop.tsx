import type { ReactNode } from "react";
import { ArrowUpRight, Phone } from "lucide-react";

import { BUSINESS } from "@/lib/site-config";
import { ShopMapFacade } from "@/components/home/shop-map-facade";
import { ADDRESS_LINES, MAPS_DIRECTIONS_URL, openingHoursLines } from "@/lib/shop-location";
import { phoneHref } from "@/lib/storefront-styles";
import { TRUST_CLAIMS } from "@/lib/trust-claims";

/**
 * Combined homepage — where the shop is. Address, hours and phone on the
 * left, a click-to-load Google map on the right (components/home/
 * shop-map-facade.tsx). Alan's trust claims are repeated here as still text,
 * since the trust marquee is the only other place they appear.
 */

const HOURS = openingHoursLines();

const LABEL = "text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground";

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-4 py-5">
      <dt className={`${LABEL} pt-1`}>{label}</dt>
      <dd className="text-base text-foreground leading-relaxed">{children}</dd>
    </div>
  );
}

export function VisitShop() {
  return (
    <section id="visit" className="scroll-mt-24 py-16 md:py-24 bg-background border-b border-border/60">
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        <div className="lg:col-span-5 flex flex-col">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-4">
            Visit the shop
          </p>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.9] text-foreground">
            Swords, Co. Dublin
          </h2>
          <p className="mt-5 text-lg text-muted-foreground max-w-md">
            Call in to handle the gear and ask questions, or drop a gun off for a repair or an
            upgrade fitted.
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-foreground">
            {TRUST_CLAIMS.map((claim) => (
              <li key={claim} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden="true" />
                {claim}
              </li>
            ))}
          </ul>

          <dl className="mt-8 divide-y divide-border border-y border-border">
            <DetailRow label="Address">
              {ADDRESS_LINES.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </DetailRow>
            <DetailRow label="Hours">
              {HOURS.map((line) => (
                <span key={line.days} className="flex justify-between gap-6 max-w-[16rem]">
                  <span>{line.days}</span>
                  <span className="tabular-nums text-muted-foreground">{line.hours}</span>
                </span>
              ))}
            </DetailRow>
            <DetailRow label="Phone">
              <a href={phoneHref(BUSINESS.telephone)} className="hover:text-accent transition-colors">
                {BUSINESS.telephone}
              </a>
            </DetailRow>
          </dl>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href={MAPS_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group h-14 px-8 inline-flex items-center justify-center gap-2 rounded-none bg-accent text-accent-foreground font-black uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
            >
              Get directions
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
            <a
              href={phoneHref(BUSINESS.telephone)}
              className="h-14 px-8 inline-flex items-center justify-center gap-2 rounded-none border-2 border-border text-foreground font-black uppercase tracking-wider hover:border-accent hover:text-accent transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call the shop
            </a>
          </div>
        </div>

        <div className="lg:col-span-7 relative min-h-[320px] md:min-h-[440px] border border-border bg-card overflow-hidden">
          <ShopMapFacade />
        </div>
      </div>
    </section>
  );
}
