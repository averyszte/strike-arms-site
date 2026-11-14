import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import ComingSoon from "@/pages/ComingSoon";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { useComingSoon } from "@/hooks/use-coming-soon";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { CartProvider } from "@/components/cart/cart-provider";
import { CUSTOMER_QUERY_ROOT, STALE_TIME_FIVE_MINUTES } from "@/lib/query-keys";
import { AccountRoutes } from "@/pages/routes/account-routes";
import { AdminRoutes } from "@/pages/routes/admin-routes";
import { StorefrontRoutes } from "@/pages/routes/storefront-routes";

const NotFound = lazy(() => import("@/pages/not-found"));

/**
 * Storefront data (catalogue, brands, rates) changes rarely, so it is kept for
 * five minutes and not refetched on every tab switch. Admin and account data
 * keep React Query's defaults: always fresh, refetched on focus.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: STALE_TIME_FIVE_MINUTES, refetchOnWindowFocus: false },
  },
});
queryClient.setQueryDefaults(["admin"], { staleTime: 0, refetchOnWindowFocus: true });
queryClient.setQueryDefaults([CUSTOMER_QUERY_ROOT], { staleTime: 0, refetchOnWindowFocus: true });

/** Shown for the moment a page's chunk is loading; the page's own height. */
const PAGE_FALLBACK = <div className="min-h-screen bg-background" aria-busy="true" />;

function Router() {
  useScrollToTop();
  const isComingSoon = useComingSoon();

  // Holding page on the live domain until launch (lib/coming-soon-gate.ts).
  if (isComingSoon) return <ComingSoon />;

  return (
    <Suspense fallback={PAGE_FALLBACK}>
      <Switch>
        <Route path="/" component={Home} />

        {/* Called, not rendered: <Switch> matches on its direct Route
            children, and wouter flattens the fragments these return. */}
        {StorefrontRoutes()}
        {AccountRoutes()}
        {AdminRoutes()}

        <Route component={NotFound} />
      </Switch>
    </Suspense>
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
