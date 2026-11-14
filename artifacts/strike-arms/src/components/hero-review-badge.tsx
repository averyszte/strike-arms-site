import { Star } from "lucide-react";

import { GOOGLE_RATING, RANKED_REVIEWS, initials } from "@/lib/review-bank";
import { READ_REVIEWS_URL } from "@/components/demo/combined/review-parts";

const AVATAR_COUNT = 4;
const RATING = Number(GOOGLE_RATING.value);
/** How much of each of the five stars to fill, so 4.7 shows a part-filled fifth star. */
const STAR_FILLS = [0, 1, 2, 3, 4].map((i) => Math.min(1, Math.max(0, RATING - i)));
const AVATARS = RANKED_REVIEWS.slice(0, AVATAR_COUNT).map((review) => initials(review.author));

/**
 * Hero trust badge: initials of real reviewers, five stars and the Google
 * rating. Links out to the full review list. Initials, not photos, because we
 * do not hold reviewers' pictures. No Google logo beside the stars, per Google.
 */
export function HeroReviewBadge() {
  return (
    <a
      href={READ_REVIEWS_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Rated ${GOOGLE_RATING.value} out of 5 on Google. Read our reviews`}
      className="group inline-flex items-center gap-4 bg-background/60 backdrop-blur-sm border border-border/60 px-4 py-3 hover:border-accent transition-colors"
    >
      <span className="flex -space-x-2" aria-hidden="true">
        {AVATARS.map((letters, i) => (
          <span
            key={i}
            className="w-9 h-9 flex items-center justify-center bg-muted border-2 border-background text-xs font-black text-foreground"
          >
            {letters}
          </span>
        ))}
      </span>
      <span className="w-px self-stretch bg-border" aria-hidden="true" />
      <span className="text-left leading-none">
        <span className="flex items-center gap-2">
          <span className="flex" aria-hidden="true">
            {STAR_FILLS.map((fill, i) => (
              <span key={i} className="relative w-4 h-4">
                <Star className="absolute inset-0 w-4 h-4 text-border" />
                <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                  <Star className="w-4 h-4 fill-accent text-accent" />
                </span>
              </span>
            ))}
          </span>
          <span className="text-base font-black tabular-nums text-foreground">{GOOGLE_RATING.value}</span>
        </span>
        <span className="mt-1.5 block text-xs text-muted-foreground group-hover:text-foreground transition-colors">
          Google reviews, Swords, Dublin
        </span>
      </span>
    </a>
  );
}
