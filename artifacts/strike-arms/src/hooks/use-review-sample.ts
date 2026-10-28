import { useState } from "react";
import { pickReviews, REVIEW_BANK, type Review } from "@/lib/review-bank";

/** A random handful from the bank, picked once per page visit. */
export function useReviewSample(count: number): Review[] {
  const [reviews] = useState(() => pickReviews(REVIEW_BANK, count));
  return reviews;
}
