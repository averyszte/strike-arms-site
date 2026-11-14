import { lazy } from "react";
import { Redirect, Route } from "wouter";

// Customer account pages, one lazy chunk each. Spread into the <Switch> in
// App.tsx: wouter flattens a fragment's routes as if they were written inline.
const Account = lazy(() => import("@/pages/Account"));
const AccountConfirm = lazy(() => import("@/pages/AccountConfirm"));
const AccountDetails = lazy(() => import("@/pages/AccountDetails"));
const AccountReset = lazy(() => import("@/pages/AccountReset"));
const AccountSignIn = lazy(() => import("@/pages/AccountSignIn"));
const AccountSignUp = lazy(() => import("@/pages/AccountSignUp"));

export function AccountRoutes() {
  return (
    <>
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
    </>
  );
}
