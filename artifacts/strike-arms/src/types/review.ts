/**
 * One real Google review, quoted word for word (Consumer Rights Act 2022: no
 * invented or edited reviews). The data is in lib/google-reviews.ts and the
 * ranking in lib/review-bank.ts; the type lives here so neither has to import
 * the other for it (W-11).
 */
export type Review = {
  author: string;
  /** The year, worked back from Google's "N years ago". */
  date: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** Empty when the reviewer left stars only. */
  text: string;
};
