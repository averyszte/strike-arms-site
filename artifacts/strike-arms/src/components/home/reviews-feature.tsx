import { RANKED_REVIEWS } from "@/lib/review-bank";
import type { Review } from "@/types/review";
import { RatingLine, ReviewButtons, ReviewCard } from "@/components/home/review-parts";

/**
 * Combined homepage — Google reviews as two rows drifting opposite ways, with
 * the "4.7 on Google" line and read/leave buttons. The rows take turns through
 * the ranked bank (lib/review-bank.ts), so both open on the best reviews.
 * Pauses on hover; still for reduced motion. Picked from /drafts/sections.
 */
// Enough cards to fill the widest screens on load.
const ON_SCREEN = 6;

/**
 * The reversed row drifts right, so new cards come in from the left: the end
 * of its list. Keep the best on screen first, then flip the rest so the next
 * best is the next one in.
 */
function forRightDrift(reviews: Review[]): Review[] {
  return [...reviews.slice(0, ON_SCREEN), ...reviews.slice(ON_SCREEN).reverse()];
}

const ROWS = [
  RANKED_REVIEWS.filter((_, i) => i % 2 === 0),
  forRightDrift(RANKED_REVIEWS.filter((_, i) => i % 2 === 1)),
];
// Same drift speed as the four-card draft: 17.5s per card.
const SECONDS_PER_CARD = 17.5;

function MarqueeRow({ reviews, isReversed }: { reviews: Review[]; isReversed: boolean }) {
  // The marquee keyframe moves a third of the track, so it needs three copies.
  const loop = [...reviews, ...reviews, ...reviews];
  return (
    <div className="overflow-hidden group">
      <div
        className="flex w-max gap-4 animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: `${reviews.length * SECONDS_PER_CARD}s`, animationDirection: isReversed ? "reverse" : "normal" }}
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
    <section className="py-16 md:py-24 bg-background border-b border-border/60 overflow-hidden">
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
        <MarqueeRow reviews={ROWS[0]} isReversed={false} />
        <MarqueeRow reviews={ROWS[1]} isReversed />
      </div>
    </section>
  );
}
