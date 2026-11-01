import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReviewSample } from "@/hooks/use-review-sample";
import { useRotatingIndex } from "@/hooks/use-rotating-index";
import { GOOGLE_RATING } from "@/lib/review-bank";
import { Eyebrow } from "@/components/demo/drafts/why-drafts-a";
import {
  GoogleG,
  RatingLine,
  ReviewButtons,
  ReviewCard,
  SampleNotice,
  Stars,
} from "@/components/demo/combined/review-parts";

/** A: a Google summary panel on the left, three random review cards beside it. */
export function ReviewsSummaryCards() {
  const reviews = useReviewSample(3);
  return (
    <section className="py-16 md:py-24 bg-card">
      <div className="container mx-auto px-4 md:px-6 grid lg:grid-cols-[minmax(0,22rem)_1fr] gap-8 lg:gap-10">
        <div className="flex flex-col gap-6 lg:pr-10 lg:border-r border-white/10">
          <Eyebrow>Reviews</Eyebrow>
          <h2 className="-mt-6 text-4xl md:text-5xl font-black uppercase tracking-tight leading-[0.9]">
            What customers <span className="text-accent">say</span>
          </h2>
          <RatingLine />
          <ReviewButtons />
          <SampleNotice />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {reviews.map((r, i) => <ReviewCard key={i} review={r} />)}
        </div>
      </div>
    </section>
  );
}

/** B: the one orange band on the page carries the rating, cards sit under it. */
export function ReviewsOrangeBand() {
  const reviews = useReviewSample(3);
  return (
    <section className="bg-background">
      <div className="bg-accent text-accent-foreground">
        <div className="container mx-auto px-4 md:px-6 py-10 md:py-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-5">
            <span className="w-16 h-16 bg-white flex items-center justify-center shrink-0">
              <GoogleG className="w-9 h-9" />
            </span>
            <div className="leading-none">
              <p className="text-4xl md:text-6xl font-black uppercase tracking-tight">{GOOGLE_RATING.value} on Google</p>
              <p className="mt-2 text-sm font-bold">As of {GOOGLE_RATING.asOf}</p>
            </div>
          </div>
          <ReviewButtons tone="accent" />
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-4">
          {reviews.map((r, i) => <ReviewCard key={i} review={r} />)}
        </div>
        <div className="mt-6"><SampleNotice /></div>
      </div>
    </section>
  );
}

/** C: one huge quote at a time, cycling through a random three, with a counter. */
export function ReviewsBigQuote() {
  const reviews = useReviewSample(3);
  const [isPaused, setIsPaused] = useState(false);
  const { index, setIndex } = useRotatingIndex(reviews.length, 7000, isPaused);
  const review = reviews[index];
  const step = (delta: number) => setIndex((index + delta + reviews.length) % reviews.length);
  if (!review) return null;
  return (
    <section
      className="py-16 md:py-28 bg-[hsl(0_0%_7%)] border-y border-white/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-10">
          <RatingLine />
          <p className="font-mono text-sm text-muted-foreground">
            <span className="text-foreground">{String(index + 1).padStart(2, "0")}</span> / {String(reviews.length).padStart(2, "0")}
          </p>
        </div>
        <figure key={index} className="animate-in fade-in duration-500">
          <Stars rating={review.rating} className="w-6 h-6" />
          <blockquote className="mt-6 max-w-5xl text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.95]">
            "{review.text}"
          </blockquote>
          <figcaption className="mt-8 text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{review.author}</span> · {review.date} · on Google
          </figcaption>
        </figure>
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex gap-2">
            <button type="button" onClick={() => step(-1)} aria-label="Previous review" className="w-12 h-12 border border-border flex items-center justify-center hover:border-accent hover:text-accent">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next review" className="w-12 h-12 border border-border flex items-center justify-center hover:border-accent hover:text-accent">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <ReviewButtons />
        </div>
      </div>
    </section>
  );
}

function MarqueeRow({ isReversed }: { isReversed: boolean }) {
  const reviews = useReviewSample(4);
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

/** D: two rows of reviews drifting opposite ways. Pauses on hover, still for reduced motion. */
export function ReviewsMarquee() {
  return (
    <section className="py-16 md:py-24 bg-card overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div>
          <Eyebrow>Reviews</Eyebrow>
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
