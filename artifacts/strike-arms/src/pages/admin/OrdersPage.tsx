import { Helmet } from 'react-helmet-async';
import { OrdersView } from '@/components/admin/OrdersView';

export default function OrdersPage() {
  return (
    <>
      <Helmet>
        <title>Orders | Strike Arms Admin</title>
      </Helmet>
      <OrdersView />
    </>
  );
}
