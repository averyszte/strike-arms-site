import { lazy, Suspense } from "react";
import { Route } from "wouter";

// Admin is one chunk of its own, with its own auth context (see AdminArea).
const AdminArea = lazy(() => import("@/pages/admin/AdminArea"));

export function AdminRoutes() {
  return (
    <>
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
    </>
  );
}
