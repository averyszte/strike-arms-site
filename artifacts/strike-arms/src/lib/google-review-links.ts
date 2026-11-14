import { GOOGLE_PLACE_ID } from "@/lib/review-bank";
import { MAPS_SEARCH_URL } from "@/lib/shop-location";

/** Opens the shop's Google reviews, or the Maps search if the place id is unset. */
export const READ_REVIEWS_URL = GOOGLE_PLACE_ID
  ? `https://www.google.com/maps/place/?q=place_id:${GOOGLE_PLACE_ID}`
  : MAPS_SEARCH_URL;

/** Opens Google's "write a review" box for the shop. */
export const WRITE_REVIEW_URL = GOOGLE_PLACE_ID
  ? `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`
  : MAPS_SEARCH_URL;
