import { ProductListingPage } from '@/components/catalog/ProductListingPage';

export default function NewArrivals() {
  return (
    <ProductListingPage
      title="New Arrivals"
      metaTitle="New Airsoft Arrivals — Latest Guns & Gear | Strike Arms Dublin"
      description="The latest airsoft guns, gear and accessories to land at Strike Arms in Swords, Co. Dublin. Fresh stock from the brands players trust, shipped across Ireland."
      path="/new"
      intro="The newest airsoft guns, gear and accessories to arrive in store. Fresh stock from the brands we trust, with expert advice and in-house support behind every purchase."
      filters={{ isNewOnly: true, sort: 'newest', pageSize: 48 }}
    />
  );
}
