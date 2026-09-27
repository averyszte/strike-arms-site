import { ProductListingPage } from '@/components/catalog/ProductListingPage';

/**
 * Alan's Jumble page: the odds and ends he turned up clearing the shop --
 * pouches, belts, slings, scopes, stocks. Most are secondhand one-offs, so the
 * shelf is built from the tag the importer gives them rather than a category,
 * because they span half the taxonomy.
 */
export default function Jumble() {
  return (
    <ProductListingPage
      title="Jumble"
      metaTitle="Jumble — Airsoft Odds and Ends, Pouches, Slings and Scopes | Strike Arms Dublin"
      description="Airsoft odds and ends at Strike Arms in Swords, Co. Dublin: pouches, belts, slings, scopes and more. Mostly secondhand one-offs, sold as seen."
      path="/jumble"
      intro="Odds and ends from the back of the shop: pouches, belts, slings, scopes, stocks and more. Most of it is secondhand and sold as seen, and nearly everything is a one-off, so once it is gone it is gone. Call in to the shop in Swords if you would rather see something in person first."
      filters={{ tag: 'jumble', sort: 'newest', pageSize: 48 }}
    />
  );
}
