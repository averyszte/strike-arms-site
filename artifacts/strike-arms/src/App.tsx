import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Contact from "@/pages/Contact";
import Brands from "@/pages/Brands";
import NewArrivals from "@/pages/NewArrivals";
import Sale from "@/pages/Sale";
import GiftCards from "@/pages/GiftCards";
import Account from "@/pages/Account";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import Privacy from "@/pages/Privacy";
import { RequireAuth } from "@/components/RequireAuth";
import { AuthProvider } from "@/lib/auth-context";
import Cart from "@/pages/Cart";
import AirsoftLaw from "@/pages/AirsoftLaw";
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
import ServicesHub from "@/pages/services/ServicesHub";
import RepairsServicePage from "@/pages/services/Repairs";
import UpgradesServicePage from "@/pages/services/Upgrades";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />

      {/* Standalone pages */}
      <Route path="/contact" component={Contact} />
      <Route path="/brands" component={Brands} />
      <Route path="/new" component={NewArrivals} />
      <Route path="/sale" component={Sale} />
      <Route path="/gift-cards" component={GiftCards} />
      <Route path="/account">
        <RequireAuth>
          <Account />
        </RequireAuth>
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/cart" component={Cart} />
      <Route path="/airsoft-law" component={AirsoftLaw} />
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
      <Route path="/services" component={ServicesHub} />

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
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
