import type { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";
import { EvolutionDraftA1, EvolutionDraftA2 } from "@/components/demo/drafts/evolution-drafts-a";
import { EvolutionDraftB1, EvolutionDraftB2 } from "@/components/demo/drafts/evolution-drafts-b";
import { EvolutionDraftC1, EvolutionDraftC2 } from "@/components/demo/drafts/evolution-drafts-c";
import { EvolutionDraftD1, EvolutionDraftD2 } from "@/components/demo/drafts/evolution-drafts-d";

/**
 * Hidden drafts page for the homepage Evolution featured section. Eight takes
 * in four directions, on stand-in data until the rifles are published.
 */
const DRAFTS: { id: string; name: string; notes: string; section: ReactNode }[] = [
  { id: "A1", name: "Owner's pick: the ledger", notes: "Sticky quote column, rifles in ruled rows by range, visit-the-shop band.", section: <EvolutionDraftA1 /> },
  { id: "A2", name: "Owner's pick: three picks", notes: "Alan's quote as a headline, one pick per range with his note on each.", section: <EvolutionDraftA2 /> },
  { id: "B1", name: "Find your Recon", notes: "Two questions (length, colour) narrow four Recons to one rifle and price.", section: <EvolutionDraftB1 /> },
  { id: "B2", name: "Price ladder", notes: "One rail from €179 to €250; tap a price to see what it buys.", section: <EvolutionDraftB2 /> },
  { id: "C1", name: "Cinematic scene band", notes: "Full-bleed scene, giant wordmark, shoppable pins, rifle rail. Stand-in photo.", section: <EvolutionDraftC1 /> },
  { id: "C2", name: "Scroll-driven ranges", notes: "Pinned scene zooms through Recon, Steel Hybrid and Sniper as you scroll.", section: <EvolutionDraftC2 /> },
  { id: "D1", name: "Accent poster band", notes: "Orange takeover, huge EVOLUTION type, 'Rifles from €179', all seven in a grid.", section: <EvolutionDraftD1 /> },
  { id: "D2", name: "Drop marquee + starter kit", notes: "Moving numbered cards, then a Recon starter kit block (price from Alan).", section: <EvolutionDraftD2 /> },
];

export default function EvolutionDrafts() {
  return (
    <>
      <Helmet>
        <title>Evolution drafts | Strike Arms</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <SiteLayout className="theme-drop">
        <div className="container mx-auto px-4 md:px-6 py-10">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Evolution drafts</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Homepage featured section for the Evolution range. Placeholder data and photos until the rifles go live.
          </p>
          <nav className="mt-6 flex flex-wrap gap-2">
            {DRAFTS.map((d) => (
              <a key={d.id} href={`#draft-${d.id}`} className="px-4 h-10 inline-flex items-center border border-border text-sm font-bold hover:border-accent hover:text-accent">
                {d.id}. {d.name}
              </a>
            ))}
          </nav>
        </div>
        {DRAFTS.map((d) => (
          <div key={d.id}>
            <div id={`draft-${d.id}`} className="scroll-mt-24 bg-foreground text-background">
              <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                <p className="font-black uppercase tracking-tight text-xl">{d.id}: {d.name}</p>
                <p className="text-sm opacity-70">{d.notes}</p>
              </div>
            </div>
            {d.section}
          </div>
        ))}
      </SiteLayout>
    </>
  );
}
