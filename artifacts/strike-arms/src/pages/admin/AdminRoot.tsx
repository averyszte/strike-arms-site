import { Switch, Route } from 'wouter';
import { AuthGuard } from '@/components/admin/AuthGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import DashboardPage from '@/pages/admin/DashboardPage';
import ProductsPage from '@/pages/admin/ProductsPage';
import OrdersPage from '@/pages/admin/OrdersPage';
import InquiriesPage from '@/pages/admin/InquiriesPage';
import CategoriesPage from '@/pages/admin/CategoriesPage';
import ChangePasswordPage from '@/pages/admin/ChangePasswordPage';
import OrderPrintPage from '@/pages/admin/OrderPrintPage';
import SettingsPage from '@/pages/admin/SettingsPage';

export default function AdminRoot() {
  return (
    <AuthGuard>
      <Switch>
        {/* Outside AdminLayout: a printed page should not carry the sidebar,
            and hiding chrome in print CSS is guesswork compared with never
            rendering it. Still inside AuthGuard -- an order is not public. */}
        <Route path="/admin/orders/:orderId/print" component={OrderPrintPage} />
        <Route>
          <AdminLayout>
            <Switch>
              <Route path="/admin/products" component={ProductsPage} />
              <Route path="/admin/orders" component={OrdersPage} />
              <Route path="/admin/inquiries" component={InquiriesPage} />
              <Route path="/admin/categories" component={CategoriesPage} />
              <Route path="/admin/settings" component={SettingsPage} />
              <Route path="/admin/change-password" component={ChangePasswordPage} />
              <Route path="/admin" component={DashboardPage} />
            </Switch>
          </AdminLayout>
        </Route>
      </Switch>
    </AuthGuard>
  );
}
