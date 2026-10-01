import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Contact from "@/pages/Contact";
import Brands from "@/pages/Brands";
import BrandPage from "@/pages/BrandPage";
import NewArrivals from "@/pages/NewArrivals";
import Sale from "@/pages/Sale";
import PreLoved from "@/pages/PreLoved";
import Jumble from "@/pages/Jumble";
import SafetyEquipment from "@/pages/SafetyEquipment";
import GiftCards from "@/pages/GiftCards";
import Account from "@/pages/Account";
import AccountConfirm from "@/pages/AccountConfirm";
import AccountDetails from "@/pages/AccountDetails";
import AccountReset from "@/pages/AccountReset";
import AccountSignIn from "@/pages/AccountSignIn";
import AccountSignUp from "@/pages/AccountSignUp";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Returns from "@/pages/Returns";
import Delivery from "@/pages/Delivery";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { CartProvider } from "@/lib/cart-context";
import Cart from "@/pages/Cart";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import AirsoftLaw from "@/pages/AirsoftLaw";
import WhereToPlay from "@/pages/WhereToPlay";
import Glossary from "@/pages/Glossary";
import GuidesHub from "@/pages/GuidesHub";
import BeginnersGuide from "@/pages/guides/BeginnersGuide";
import FirstAirsoftGun from "@/pages/guides/FirstAirsoftGun";
import AegVsGbbVsSpring from "@/pages/guides/AegVsGbbVsSpring";
import FpsAndJoules from "@/pages/guides/FpsAndJoules";
import BbWeightGuide from "@/pages/guides/BbWeightGuide";
import BatteryGuide from "@/pages/guides/BatteryGuide";
import GasTypesGuide from "@/pages/guides/GasTypesGuide";
import LoadoutCqb from "@/pages/guides/LoadoutCqb";
import LoadoutWoodland from "@/pages/guides/LoadoutWoodland";
import MaintenanceGuide from "@/pages/guides/MaintenanceGuide";
import ShopPage from "@/pages/ShopPage";
import ProductDetail from "@/pages/ProductDetail";
import { lazy, Suspense } from "react";

// Admin is lazy-loaded so the dashboard never weighs down the public bundle.
const AdminArea = lazy(() => import("@/pages/admin/AdminArea"));
import ServicesHub from "@/pages/services/ServicesHub";
import RepairsServicePage from "@/pages/services/Repairs";
import UpgradesServicePage from "@/pages/services/Upgrades";
import HopUpTuningPage from "@/pages/services/HopUpTuning";
import GearboxRebuildsPage from "@/pages/services/GearboxRebuilds";
import CustomBuildsPage from "@/pages/services/CustomBuilds";
import ChronoServicePage from "@/pages/services/ChronoService";
import About from "@/pages/About";

const queryClient = new QueryClient();

function Router() {
  useScrollToTop();

  return (
    <Switch>
      <Route path="/" component={Home} />

      {/* Standalone pages */}
      <Route path="/contact" component={Contact} />
      <Route path="/brands" component={Brands} />
      <Route path="/brands/:slug" component={BrandPage} />
      <Route path="/new" component={NewArrivals} />
      <Route path="/sale" component={Sale} />
      <Route path="/pre-loved" component={PreLoved} />
      <Route path="/jumble" component={Jumble} />
      <Route path="/safety-equipment" component={SafetyEquipment} />
      <Route path="/gift-cards" component={GiftCards} />
      <Route path="/account" component={Account} />
      <Route path="/account/sign-in" component={AccountSignIn} />
      <Route path="/account/sign-up" component={AccountSignUp} />
      <Route path="/account/confirm" component={AccountConfirm} />
      <Route path="/account/reset" component={AccountReset} />
      <Route path="/account/details" component={AccountDetails} />
      {/* The old site's sign-in pages. */}
      <Route path="/login">
        <Redirect to="/account/sign-in" replace />
      </Route>
      <Route path="/signup">
        <Redirect to="/account/sign-up" replace />
      </Route>
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

      {/* Services hub — more-specific routes first */}
      <Route path="/services/repairs" component={RepairsServicePage} />
      <Route path="/services/upgrades" component={UpgradesServicePage} />
      <Route path="/services/hop-up-tuning" component={HopUpTuningPage} />
      <Route path="/services/gearbox-rebuilds" component={GearboxRebuildsPage} />
      <Route path="/services/custom-builds" component={CustomBuildsPage} />
      <Route path="/services/chrono-service" component={ChronoServicePage} />
      <Route path="/services" component={ServicesHub} />
      <Route path="/about" component={About} />

      {/* Admin, with its own auth context (see AdminArea) */}
      <Route path="/auth/confirm">
        <Suspense fallback={null}>
          <AdminArea />
        </Suspense>
      </Route>
      <Route path="/admin/*?">
        <Suspense fallback={null}>
          <AdminArea />
        </Suspense>
      </Route>

      {/* Product detail pages */}
      <Route path="/products/:slug" component={ProductDetail} />

      {/* Store / catalog — more-specific routes first */}
      <Route path="/store/:category/:subcategory" component={ShopPage} />
      <Route path="/store/:category" component={ShopPage} />
      <Route path="/store" component={ShopPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <CartProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AppErrorBoundary>
                <Router />
              </AppErrorBoundary>
            </WouterRouter>
            <Toaster />
          </CartProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
