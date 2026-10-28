import { ArrowUpRight, Star } from "lucide-react";
import { GOOGLE_PLACE_ID, GOOGLE_RATING, initials, type Review } from "@/lib/review-bank";
import { MAPS_SEARCH_URL } from "@/lib/shop-location";

export const READ_REVIEWS_URL = GOOGLE_PLACE_ID
  ? `https://www.google.com/maps/place/?q=place_id:${GOOGLE_PLACE_ID}`
  : MAPS_SEARCH_URL;
export const WRITE_REVIEW_URL = GOOGLE_PLACE_ID
  ? `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`
  : MAPS_SEARCH_URL;

/** Google's four-colour G, unaltered, as its brand guidance asks. */
export function GoogleG({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-label="Google" role="img">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

export function Stars({ rating, className = "w-4 h-4" }: { rating: number; className?: string }) {
  return (
    <span className="flex" aria-label={`${rating} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={`${className} ${i < rating ? "fill-accent text-accent" : "text-border"}`} />
      ))}
    </span>
  );
}

/** "4.7 on Google" with the as-of date. No stars beside the G, per Google. */
export function RatingLine({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <div className="flex items-center gap-3">
      <GoogleG className={size === "lg" ? "w-10 h-10" : "w-7 h-7"} />
      <div className="leading-none">
        <p className={`font-black uppercase tracking-tight ${size === "lg" ? "text-4xl md:text-5xl" : "text-2xl"}`}>
          {GOOGLE_RATING.value} <span className="text-muted-foreground">on Google</span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">As of {GOOGLE_RATING.asOf}</p>
      </div>
    </div>
  );
}

export function ReviewButtons({ tone = "dark" }: { tone?: "dark" | "accent" }) {
  const primary = tone === "accent"
    ? "bg-background text-foreground hover:bg-foreground hover:text-background"
    : "bg-accent text-accent-foreground hover:bg-foreground hover:text-background";
  const secondary = tone === "accent"
    ? "border-background text-background hover:bg-background hover:text-foreground"
    : "border-border text-foreground hover:border-accent hover:text-accent";
  const base = "inline-flex h-12 items-center justify-center gap-2 px-6 text-sm font-black uppercase tracking-wider transition-colors";
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <a href={READ_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className={`${base} ${primary}`}>
        Read all reviews <ArrowUpRight className="w-4 h-4" />
      </a>
      <a href={WRITE_REVIEW_URL} target="_blank" rel="noopener noreferrer" className={`${base} border-2 ${secondary}`}>
        Leave a review
      </a>
    </div>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="flex flex-col h-full bg-background border border-border/60 p-6 md:p-7">
      <div className="flex items-center justify-between mb-5">
        <Stars rating={review.rating} />
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-accent">{review.tag}</span>
      </div>
      <blockquote className="flex-1 text-lg leading-snug text-foreground">{review.text}</blockquote>
      <figcaption className="mt-6 pt-5 border-t border-border/60 flex items-center gap-3">
        <span className="w-10 h-10 shrink-0 bg-muted border border-border flex items-center justify-center text-sm font-black">
          {initials(review.author)}
        </span>
        <span className="flex-1 leading-tight">
          <span className="block text-sm font-bold">{review.author}</span>
          <span className="block text-xs text-muted-foreground">{review.date}</span>
        </span>
        <GoogleG className="w-5 h-5" />
      </figcaption>
    </figure>
  );
}

export function SampleNotice() {
  return (
    <p className="text-xs text-muted-foreground">
      A random selection of reviews from our Google Business Profile, shown with permission.
    </p>
  );
}
