import { ProductListingPage } from '@/components/catalog/ProductListingPage';

/**
 * Alan keeps a Pre-Loved page on the old site, and these are the items people
 * ring up about. A shelf of its own rather than only a sidebar tick, so it can
 * be linked, shared and found — and so the sold-as-seen warning is the first
 * thing on it instead of a sentence inside each product.
 */
export default function PreLoved() {
  return (
    <ProductListingPage
      title="Pre-Loved"
      metaTitle="Pre-Loved Airsoft Guns — Secondhand Rifles & Pistols | Strike Arms Dublin"
      description="Secondhand airsoft rifles, pistols and SMGs at Strike Arms in Swords, Co. Dublin. Every pre-loved item is a one-off, sold as seen, and needs a battery and charger."
      path="/pre-loved"
      intro="Secondhand airsoft guns, sold as seen. Every pre-loved item is a one-off, so once it is gone it is gone, and each will need a battery and a charger — neither is included. Call in to the shop in Swords if you would rather see one in person first."
      filters={{ condition: 'pre-loved', sort: 'newest', pageSize: 48 }}
    />
  );
}
