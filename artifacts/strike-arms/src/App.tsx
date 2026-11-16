import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import ComingSoon from "@/pages/ComingSoon";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { useComingSoon } from "@/hooks/use-coming-soon";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { CartProvider } from "@/components/cart/cart-provider";
import { AccountRoutes } from "@/pages/routes/account-routes";
import { AdminRoutes } from "@/pages/routes/admin-routes";
import { StorefrontRoutes } from "@/pages/routes/storefront-routes";
import { SITE_LEGAL_NAME } from "@/lib/site-config";

const NotFound = lazy(() => import("@/pages/not-found"));

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

export interface AppProps {
  queryClient: QueryClient;
  /** Build-time prerender only: the route to render, and its query string. */
  ssrPath?: string;
  ssrSearch?: string;
  /** True when the browser is hydrating a prerendered page (main.tsx). */
  isHydrating?: boolean;
}

function App({ queryClient, ssrPath, ssrSearch, isHydrating = false }: AppProps) {
  return (
    <HelmetProvider>
      {/* Site-wide social tags no page sets itself. On React 19 Helmet does
          not de-duplicate across instances, so never put a tag here that a
          page also sets (og:image, og:title...). Twitter falls back to og:. */}
      <Helmet>
        <meta property="og:site_name" content={SITE_LEGAL_NAME} />
        <meta property="og:locale" content="en_IE" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <QueryClientProvider client={queryClient}>
        {/* No TooltipProvider: nothing renders a Radix tooltip, and the
            provider alone was about 32 kB of the entry chunk (N-041). Add
            one back here if a tooltip is ever used. */}
        <CartProvider isHydrating={isHydrating}>
          <WouterRouter
            base={import.meta.env.BASE_URL.replace(/\/$/, "")}
            ssrPath={ssrPath}
            ssrSearch={ssrSearch}
          >
            <AppErrorBoundary>
              <Router />
            </AppErrorBoundary>
            <CookieConsentBanner />
          </WouterRouter>
          <Toaster />
        </CartProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
