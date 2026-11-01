import { useReviewSample } from "@/hooks/use-review-sample";
import { RatingLine, ReviewButtons, ReviewCard, SampleNotice } from "@/components/demo/combined/review-parts";

/**
 * Combined homepage — Google reviews as two rows drifting opposite ways, with
 * the "4.7 on Google" line and read/leave buttons. Reviews come from the bank
 * (lib/review-bank.ts), a random pick per visit. Pauses on hover; still for
 * reduced motion. Picked from /drafts/sections.
 */
function MarqueeRow({ isReversed }: { isReversed: boolean }) {
  const reviews = useReviewSample(4);
  // The marquee keyframe moves a third of the track, so it needs three copies.
  const loop = [...reviews, ...reviews, ...reviews];
  return (
    <div className="overflow-hidden group">
      <div
        className="flex w-max gap-4 animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: "70s", animationDirection: isReversed ? "reverse" : "normal" }}
      >
        {loop.map((r, i) => (
          <div key={i} className="w-[22rem] shrink-0" aria-hidden={i >= reviews.length}>
            <ReviewCard review={r} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReviewsFeature() {
  return (
    <section className="py-16 md:py-24 bg-card border-b border-border/60 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-3">Reviews</p>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.9] mb-6">
            Heard at <span className="text-accent">the counter</span>
          </h2>
          <RatingLine />
        </div>
        <ReviewButtons />
      </div>
      <div className="flex flex-col gap-4">
        <MarqueeRow isReversed={false} />
        <MarqueeRow isReversed />
      </div>
      <div className="container mx-auto px-4 md:px-6 mt-6"><SampleNotice /></div>
    </section>
  );
}
