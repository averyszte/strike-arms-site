import { GOOGLE_REVIEWS } from "@/lib/google-reviews";

/**
 * The review bank: real Google reviews shown on the site, best first.
 *
 * Every entry must be a real review from the Google Business Profile, quoted
 * word for word. Consumer Rights Act 2022: no invented or edited reviews.
 * The data lives in lib/google-reviews.ts.
 */
export type Review = {
  author: string;
  /** The year, worked back from Google's "N years ago". */
  date: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** Empty when the reviewer left stars only. */
  text: string;
};

/** "4.7 on Google". Google asks for an "as of" date beside it. */
export const GOOGLE_RATING = { value: "4.7", asOf: "November 2026" };

// The profile's place ID, read off Google's reviews panel (Nov 2026). It
// unlocks the direct "write a review" link; set it to null to fall back to
// the Maps listing.
export const GOOGLE_PLACE_ID: string | null = "ChIJAdXwW1gQZ0gRF4HsOc7rAU0";

/** 5 stars with a comment, then 4 with, then 5 without, then 4 without. Lower ratings are dropped. */
function priority(review: Review): number {
  const tier = review.rating === 5 ? 0 : 1;
  return review.text ? tier : tier + 2;
}

/** Reviews of 4 stars and up in display order. Stable, so Google's order holds within each group. */
export function rankReviews(bank: Review[]): Review[] {
  return bank.filter((r) => r.rating >= 4).sort((a, b) => priority(a) - priority(b));
}

export const RANKED_REVIEWS = rankReviews(GOOGLE_REVIEWS);

export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}
