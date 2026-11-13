import { ProductListingPage } from '@/components/catalog/ProductListingPage';

/**
 * Alan's Evolution range: the rifles he most wants to sell. Built from the
 * `evolution-range` tag the importer gives them rather than the brand, which
 * would also pull in the Evolution Matrix magazines.
 */
export default function Evolution() {
  return (
    <ProductListingPage
      title="Evolution Range"
      eyebrow="Featured line"
      metaTitle="Evolution Airsoft Rifles, Recon M4, MK18, AK and M40 | Strike Arms Dublin"
      description="Evolution airsoft rifles at Strike Arms in Swords, Co. Dublin: the Recon Carbontech M4s, the MK18 Mod 1 Metal Hybrid, the E-104 Tanker AK and the M40 sniper rifle."
      path="/evolution"
      intro="The Evolution line is the range we stock and recommend most. Lightweight Recon Carbontech M4s, the MK18 Mod 1 Metal Hybrid, a full metal AK and a spring powered M40 sniper rifle. Call in to the shop in Swords to handle one before you buy."
      filters={{ tag: 'evolution-range', sort: 'featured', pageSize: 48 }}
    />
  );
}
