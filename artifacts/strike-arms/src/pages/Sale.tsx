import { ProductListingPage } from '@/components/catalog/ProductListingPage';

export default function Sale() {
  return (
    <ProductListingPage
      title="Sale"
      metaTitle="Airsoft Sale — Discounted Guns & Gear | Strike Arms Dublin"
      description="Discounted airsoft rifles, pistols, gear and accessories at Strike Arms. Genuine reductions on quality kit, with in-house advice and support. Ships across Ireland."
      path="/sale"
      intro="Current reductions across airsoft guns, gear and accessories. Genuine savings on quality kit, backed by the same expert advice and in-house support as everything else we sell."
      filters={{ onSaleOnly: true, sort: 'featured', pageSize: 48 }}
    />
  );
}
