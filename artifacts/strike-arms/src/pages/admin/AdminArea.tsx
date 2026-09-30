import { Route, Switch } from 'wouter';

import { AdminAuthProvider } from '@/lib/admin-auth-context';
import AcceptInvitePage from '@/pages/admin/AcceptInvitePage';
import AdminRoot from '@/pages/admin/AdminRoot';
import LoginPage from '@/pages/admin/LoginPage';
import ResetPasswordPage from '@/pages/admin/ResetPasswordPage';

/**
 * Every admin route, inside the admin auth context. The context asks the
 * database whether the signed-in user is an admin and what their MFA level
 * is; with customer accounts, running that on every storefront page would
 * query it for every shopper. Loaded lazily from App, so none of the admin
 * code is in the storefront bundle either.
 *
 * Login, invite-accept and password reset are public; AdminRoot is behind
 * AuthGuard.
 */
export default function AdminArea() {
  return (
    <AdminAuthProvider>
      <Switch>
        <Route path="/admin/login" component={LoginPage} />
        <Route path="/auth/confirm" component={AcceptInvitePage} />
        <Route path="/admin/reset-password" component={ResetPasswordPage} />
        <Route component={AdminRoot} />
      </Switch>
    </AdminAuthProvider>
  );
}
