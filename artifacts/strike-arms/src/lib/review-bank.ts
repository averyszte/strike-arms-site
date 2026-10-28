/**
 * The review bank: Google reviews shown on the site, a few at random per page.
 *
 * Every entry must be a real review from the Google Business Profile, quoted
 * word for word (cuts marked with an ellipsis), with the name and date as
 * Google shows them, and the reviewer's OK to use it. Consumer Rights Act 2022:
 * no invented or edited reviews. Include the honest four-star ones too.
 *
 * The entries below marked isSample are placeholders for the drafts page only.
 * Replace them with Alan's real reviews before any of this goes live.
 */
export type Review = {
  author: string;
  /** As Google shows it, e.g. "March 2026". */
  date: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  /** What the review is about, so it can back up a service. */
  tag: "Advice" | "Repairs" | "Shop" | "First setup";
  isSample: boolean;
};

/** "4.7 on Google". Google asks for an "as of" date beside it. */
export const GOOGLE_RATING = { value: "4.7", asOf: "October 2026" };

// Not known yet: the profile's place ID unlocks the direct "write a review"
// link (https://search.google.com/local/writereview?placeid=...). Until then
// both buttons open the Maps listing.
export const GOOGLE_PLACE_ID: string | null = null;

export const REVIEW_BANK: Review[] = [
  { author: "Sample reviewer", date: "Sample date", rating: 5, tag: "Shop", isSample: true,
    text: "Best airsoft shop in Dublin, hands down. Fair prices and the advice is worth the visit alone." },
  { author: "Sample reviewer", date: "Sample date", rating: 5, tag: "Advice", isSample: true,
    text: "Alan spent 20 minutes explaining setups. Couldn't ask for better service." },
  { author: "Sample reviewer", date: "Sample date", rating: 5, tag: "Repairs", isSample: true,
    text: "Fixed my rifle fast and cheaply. Wouldn't go anywhere else for repairs." },
  { author: "Sample reviewer", date: "Sample date", rating: 4, tag: "First setup", isSample: true,
    text: "Placeholder: a real four-star review goes here. Honest mixed reviews make the rest believable." },
  { author: "Sample reviewer", date: "Sample date", rating: 5, tag: "Repairs", isSample: true,
    text: "Placeholder: a real review about a repair or upgrade goes here." },
  { author: "Sample reviewer", date: "Sample date", rating: 5, tag: "First setup", isSample: true,
    text: "Placeholder: a real review from someone who got their first setup here goes here." },
];

/** `count` distinct reviews in random order. `random` is injectable for tests. */
export function pickReviews(bank: Review[], count: number, random: () => number = Math.random): Review[] {
  const pool = [...bank];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}
