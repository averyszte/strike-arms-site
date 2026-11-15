import { Helmet } from 'react-helmet-async';

import { ProductListingPage } from '@/components/catalog/ProductListingPage';
import { useProducts } from '@/hooks/useProducts';
import type { ProductFilters } from '@/types/product';

const SALE_FILTERS: ProductFilters = { onSaleOnly: true, sort: 'featured', pageSize: 48 };

export default function Sale() {
  // The same filters as the listing, so React Query serves both from one
  // request. An empty sale page is a soft 404, so it is noindexed until
  // something is reduced (N-009); scripts/generate-sitemap.mjs drops it too.
  const { data } = useProducts(SALE_FILTERS);
  const isEmpty = data !== undefined && data.total === 0;

  return (
    <>
      {isEmpty && (
        <Helmet>
          <meta name="robots" content="noindex,follow" />
        </Helmet>
      )}
      <ProductListingPage
        title="Sale"
        metaTitle="Airsoft Sale — Discounted Guns & Gear | Strike Arms Dublin"
        description="Discounted airsoft rifles, pistols, gear and accessories at Strike Arms. Genuine reductions on quality kit. Collect in store in Swords, Co. Dublin."
        path="/sale"
        intro="Current reductions across airsoft guns, gear and accessories. Genuine savings on quality kit, backed by the same expert advice and in-house support as everything else we sell."
        filters={SALE_FILTERS}
      />
    </>
  );
}
