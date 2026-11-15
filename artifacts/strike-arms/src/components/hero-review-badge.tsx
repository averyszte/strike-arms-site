import { Star } from "lucide-react";

import { GOOGLE_RATING } from "@/lib/review-bank";
import { GoogleG } from "@/components/home/review-parts";
import { READ_REVIEWS_URL } from "@/lib/google-review-links";

const RATING = Number(GOOGLE_RATING.value);
/** How much of each of the five stars to fill, so 4.7 shows a part-filled fifth star. */
const STAR_FILLS = [0, 1, 2, 3, 4].map((i) => Math.min(1, Math.max(0, RATING - i)));

/** Hero trust line: Google logo, rating and stars on one quiet line, linking to the reviews. */
export function HeroReviewBadge() {
  return (
    <a
      href={READ_REVIEWS_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Rated ${GOOGLE_RATING.value} out of 5 from ${GOOGLE_RATING.count} Google reviews. Read our reviews`}
      className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <GoogleG className="w-4 h-4" />
      <span className="font-bold tabular-nums text-foreground">{GOOGLE_RATING.value}</span>
      <span className="flex" aria-hidden="true">
        {STAR_FILLS.map((fill, i) => (
          <span key={i} className="relative w-3.5 h-3.5">
            <Star className="absolute inset-0 w-3.5 h-3.5 text-border" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="w-3.5 h-3.5 fill-accent text-accent" />
            </span>
          </span>
        ))}
      </span>
      <span className="group-hover:underline underline-offset-4">{GOOGLE_RATING.count} Google reviews</span>
    </a>
  );
}
