import { Helmet } from 'react-helmet-async';
import { InquiriesTable } from '@/components/admin/InquiriesTable';

export default function InquiriesPage() {
  return (
    <>
      <Helmet>
        <title>Inquiries | Strike Arms Admin</title>
      </Helmet>
      <InquiriesTable />
    </>
  );
}
