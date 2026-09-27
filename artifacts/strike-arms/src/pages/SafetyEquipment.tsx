import { ProductListingPage } from '@/components/catalog/ProductListingPage';

/**
 * Alan renamed his Masks and Goggles page to Safety Equipment and means to add
 * vests and helmets to it. Those sit in different subcategories, so this shelf
 * is built from a 'safety' tag rather than from any one of them.
 *
 * No protection rating is claimed here. Alan has not stated one for anything he
 * stocks, and a wrong one is the kind of claim that hurts someone.
 */
export default function SafetyEquipment() {
  return (
    <ProductListingPage
      title="Safety Equipment"
      metaTitle="Airsoft Safety Equipment — Goggles, Masks and Gloves | Strike Arms Dublin"
      description="Airsoft safety equipment at Strike Arms in Swords, Co. Dublin: goggles, mesh visors, half masks and tactical gloves."
      path="/safety-equipment"
      intro="Goggles, mesh visors, half masks and gloves. Eye protection is the one piece of kit you never compromise on, so if you are not sure what suits the way you play, call in to the shop in Swords and try it on first."
      filters={{ tag: 'safety', sort: 'featured', pageSize: 48 }}
    />
  );
}
