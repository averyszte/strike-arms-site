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
import Cart from "@/pages/Cart";
import AirsoftLaw from "@/pages/AirsoftLaw";
import ShopPage from "@/pages/ShopPage";
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
      <Route path="/account" component={Account} />
      <Route path="/cart" component={Cart} />
      <Route path="/airsoft-law" component={AirsoftLaw} />

      {/* Services hub — more-specific routes first */}
      <Route path="/services/repairs" component={RepairsServicePage} />
      <Route path="/services/upgrades" component={UpgradesServicePage} />
      <Route path="/services" component={ServicesHub} />

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
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
