import type { ReactNode } from "react";
import { ArrowUpRight, Phone } from "lucide-react";

import { BUSINESS } from "@/lib/site-config";
import {
  ADDRESS_LINES,
  MAPS_DIRECTIONS_URL,
  MAPS_EMBED_URL,
  openingHoursLines,
} from "@/lib/shop-location";
import { phoneHref } from "@/lib/storefront-styles";

/**
 * Combined homepage — where the shop is. Address, hours and phone on the
 * left, a live Google map on the right. The map is inverted to sit on the
 * dark page; hue-rotate puts the pin and roads back near their own colours.
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
    <section className="py-16 md:py-24 bg-background border-b border-border/60">
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
          <iframe
            title={`Map showing ${BUSINESS.name}, ${BUSINESS.addressLocality}`}
            src={MAPS_EMBED_URL}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0 [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.7)_contrast(0.9)]"
          />
        </div>
      </div>
    </section>
  );
}
