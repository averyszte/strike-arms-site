import type { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { SiteLayout } from "@/components/SiteLayout";
import { Lineup } from "@/components/demo/combined/lineup";
import { WhyOwnerRows, WhyStats } from "@/components/demo/drafts/why-drafts-a";
import { WhyManifesto, WhyPhotoCards, WhySpecSheet } from "@/components/demo/drafts/why-drafts-b";
import {
  ReviewsBigQuote,
  ReviewsMarquee,
  ReviewsOrangeBand,
  ReviewsSummaryCards,
} from "@/components/demo/drafts/review-drafts";

/**
 * Hidden drafts page for the homepage "Why Strike Arms" and reviews sections.
 * Each combo shows Why, the guides section, then Reviews, in homepage order,
 * so the background rhythm can be judged as well as the sections themselves.
 * Reviews are placeholders until Alan's real Google reviews are in the bank.
 */
const COMBOS: { id: string; name: string; notes: string; why: ReactNode; reviews: ReactNode }[] = [
  {
    id: "1",
    name: "Owner + rows / Google panel + cards",
    notes: "Black, then the guides on grey, then reviews on grey. Safest and most 'shop'.",
    why: <WhyOwnerRows />,
    reviews: <ReviewsSummaryCards />,
  },
  {
    id: "2",
    name: "Manifesto photo band / orange rating band",
    notes: "Full-bleed photo breaks the grey. Orange band is the page's one orange moment besides the trust strip.",
    why: <WhyManifesto />,
    reviews: <ReviewsOrangeBand />,
  },
  {
    id: "3",
    name: "Stat callouts / single big quote",
    notes: "Numbers do the talking, then one review at a time, loud. Fewest words on screen.",
    why: <WhyStats />,
    reviews: <ReviewsBigQuote />,
  },
  {
    id: "4",
    name: "Photo cards / moving review rows",
    notes: "Most visual. Needs real photos for each reason. Marquee pauses on hover.",
    why: <WhyPhotoCards />,
    reviews: <ReviewsMarquee />,
  },
  {
    id: "5",
    name: "Spec sheet / Google panel + cards",
    notes: "Workshop feel, dense and honest. Pairs with the plainest reviews layout.",
    why: <WhySpecSheet />,
    reviews: <ReviewsSummaryCards />,
  },
];

function DraftLabel({ id, name, notes }: { id: string; name: string; notes: string }) {
  return (
    <div id={`combo-${id}`} className="scroll-mt-24 bg-foreground text-background">
      <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
        <p className="font-black uppercase tracking-tight text-xl">Combo {id}: {name}</p>
        <p className="text-sm opacity-70">{notes}</p>
      </div>
    </div>
  );
}

export default function SectionDrafts() {
  return (
    <>
      <Helmet>
        <title>Section drafts | Strike Arms</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <SiteLayout className="theme-drop">
        <div className="container mx-auto px-4 md:px-6 py-10">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">Section drafts</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            "Why Strike Arms" and reviews, mixed and matched. Each combo runs Why, then guides, then reviews,
            like the homepage. Refresh to see a different random three reviews. Review text is placeholder.
          </p>
          <nav className="mt-6 flex flex-wrap gap-2">
            {COMBOS.map((c) => (
              <a key={c.id} href={`#combo-${c.id}`} className="px-4 h-10 inline-flex items-center border border-border text-sm font-bold hover:border-accent hover:text-accent">
                {c.id}. {c.name}
              </a>
            ))}
          </nav>
        </div>
        {COMBOS.map((c) => (
          <div key={c.id}>
            <DraftLabel id={c.id} name={c.name} notes={c.notes} />
            {c.why}
            <Lineup />
            {c.reviews}
          </div>
        ))}
      </SiteLayout>
    </>
  );
}
