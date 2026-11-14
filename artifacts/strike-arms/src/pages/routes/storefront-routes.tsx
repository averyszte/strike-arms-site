import { lazy } from "react";
import { Route } from "wouter";

// Every storefront page but the home page (and the holding page) is its own
// chunk, so a first visit downloads only what it shows. Spread into the
// <Switch> in App.tsx: wouter flattens a fragment's routes as if inline.
const Contact = lazy(() => import("@/pages/Contact"));
const Brands = lazy(() => import("@/pages/Brands"));
const BrandPage = lazy(() => import("@/pages/BrandPage"));
const NewArrivals = lazy(() => import("@/pages/NewArrivals"));
const Sale = lazy(() => import("@/pages/Sale"));
const PreLoved = lazy(() => import("@/pages/PreLoved"));
const Jumble = lazy(() => import("@/pages/Jumble"));
const Evolution = lazy(() => import("@/pages/Evolution"));
const SafetyEquipment = lazy(() => import("@/pages/SafetyEquipment"));
const GiftCards = lazy(() => import("@/pages/GiftCards"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const Returns = lazy(() => import("@/pages/Returns"));
const Delivery = lazy(() => import("@/pages/Delivery"));
const Cart = lazy(() => import("@/pages/Cart"));
const CheckoutSuccess = lazy(() => import("@/pages/CheckoutSuccess"));
const AirsoftLaw = lazy(() => import("@/pages/AirsoftLaw"));
const WhereToPlay = lazy(() => import("@/pages/WhereToPlay"));
const Glossary = lazy(() => import("@/pages/Glossary"));
const GuidesHub = lazy(() => import("@/pages/GuidesHub"));
const BeginnersGuide = lazy(() => import("@/pages/guides/BeginnersGuide"));
const FirstAirsoftGun = lazy(() => import("@/pages/guides/FirstAirsoftGun"));
const AegVsGbbVsSpring = lazy(() => import("@/pages/guides/AegVsGbbVsSpring"));
const FpsAndJoules = lazy(() => import("@/pages/guides/FpsAndJoules"));
const BbWeightGuide = lazy(() => import("@/pages/guides/BbWeightGuide"));
const BatteryGuide = lazy(() => import("@/pages/guides/BatteryGuide"));
const GasTypesGuide = lazy(() => import("@/pages/guides/GasTypesGuide"));
const LoadoutCqb = lazy(() => import("@/pages/guides/LoadoutCqb"));
const LoadoutWoodland = lazy(() => import("@/pages/guides/LoadoutWoodland"));
const MaintenanceGuide = lazy(() => import("@/pages/guides/MaintenanceGuide"));
const UpgradesGuide = lazy(() => import("@/pages/guides/UpgradesGuide"));
const UpgradesServicePage = lazy(() => import("@/pages/services/Upgrades"));
const ShopPage = lazy(() => import("@/pages/ShopPage"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const ServicesHub = lazy(() => import("@/pages/services/ServicesHub"));
const RepairsServicePage = lazy(() => import("@/pages/services/Repairs"));
const HopUpTuningPage = lazy(() => import("@/pages/services/HopUpTuning"));
const GearboxRebuildsPage = lazy(() => import("@/pages/services/GearboxRebuilds"));
const CustomBuildsPage = lazy(() => import("@/pages/services/CustomBuilds"));
const ChronoServicePage = lazy(() => import("@/pages/services/ChronoService"));
const About = lazy(() => import("@/pages/About"));

export function StorefrontRoutes() {
  return (
    <>
      {/* Standalone pages */}
      <Route path="/contact" component={Contact} />
      <Route path="/brands" component={Brands} />
      <Route path="/brands/:slug" component={BrandPage} />
      <Route path="/new" component={NewArrivals} />
      <Route path="/sale" component={Sale} />
      <Route path="/pre-loved" component={PreLoved} />
      <Route path="/jumble" component={Jumble} />
      <Route path="/evolution" component={Evolution} />
      <Route path="/safety-equipment" component={SafetyEquipment} />
      <Route path="/gift-cards" component={GiftCards} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/returns" component={Returns} />
      <Route path="/delivery" component={Delivery} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/airsoft-law" component={AirsoftLaw} />
      <Route path="/where-to-play" component={WhereToPlay} />
      <Route path="/glossary" component={Glossary} />

      {/* Guides */}
      <Route path="/guides" component={GuidesHub} />
      <Route path="/guides/beginners-guide" component={BeginnersGuide} />
      <Route path="/guides/first-airsoft-gun" component={FirstAirsoftGun} />
      <Route path="/guides/aeg-vs-gbb-vs-spring" component={AegVsGbbVsSpring} />
      <Route path="/guides/fps-and-joules-explained" component={FpsAndJoules} />
      <Route path="/guides/airsoft-bb-weight-guide" component={BbWeightGuide} />
      <Route path="/guides/airsoft-battery-lipo-guide" component={BatteryGuide} />
      <Route path="/guides/airsoft-gas-types" component={GasTypesGuide} />
      <Route path="/guides/loadout-cqb" component={LoadoutCqb} />
      <Route path="/guides/loadout-woodland" component={LoadoutWoodland} />
      <Route path="/guides/airsoft-maintenance" component={MaintenanceGuide} />
      <Route path="/guides/airsoft-upgrades" component={UpgradesGuide} />

      {/* Services hub — more-specific routes first */}
      <Route path="/services/repairs" component={RepairsServicePage} />
      <Route path="/services/upgrades" component={UpgradesServicePage} />
      <Route path="/services/hop-up-tuning" component={HopUpTuningPage} />
      <Route path="/services/gearbox-rebuilds" component={GearboxRebuildsPage} />
      <Route path="/services/custom-builds" component={CustomBuildsPage} />
      <Route path="/services/chrono-service" component={ChronoServicePage} />
      <Route path="/services" component={ServicesHub} />
      <Route path="/about" component={About} />

      {/* Product detail pages */}
      <Route path="/products/:slug" component={ProductDetail} />

      {/* Store / catalog — more-specific routes first */}
      <Route path="/store/:category/:subcategory" component={ShopPage} />
      <Route path="/store/:category" component={ShopPage} />
      <Route path="/store" component={ShopPage} />
    </>
  );
}
