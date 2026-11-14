/** What the catalogue says now about a product in the basket. */
export type FreshCartDetails = {
  productId: string;
  name: string;
  unitPriceCents: number;
  isShippable: boolean;
  isInStock: boolean;
};

/** What changed when the basket was checked against the catalogue. */
export type CartRefreshChanges = {
  /** Names of lines whose price is different from when they were added. */
  repriced: string[];
  /** Names of lines that can no longer be posted. */
  noLongerShippable: string[];
  /** Names of lines taken out because the product is no longer for sale. */
  removed: string[];
  /** Names of lines whose product is out of stock now. They stay in the cart. */
  outOfStock: string[];
};
