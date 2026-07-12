import { Helmet } from 'react-helmet-async';
import { ProductsTable } from '@/components/admin/ProductsTable';

export default function ProductsPage() {
  return (
    <>
      <Helmet>
        <title>Products | Strike Arms Admin</title>
      </Helmet>
      <ProductsTable />
    </>
  );
}
