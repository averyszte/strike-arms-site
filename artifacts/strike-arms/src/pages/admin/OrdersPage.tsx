import { Helmet } from 'react-helmet-async';
import { OrdersTable } from '@/components/admin/OrdersTable';

export default function OrdersPage() {
  return (
    <>
      <Helmet>
        <title>Orders | Strike Arms Admin</title>
      </Helmet>
      <OrdersTable />
    </>
  );
}
