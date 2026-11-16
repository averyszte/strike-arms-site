import { useCallback } from 'react';

import { useCsvDownload } from '@/hooks/use-csv-download';
import { useToast } from '@/hooks/use-toast';
import { csvFilename } from '@/lib/csv-write';
import { customersToCsv, mailingListToCsv } from '@/lib/customers-csv';
import type { AdminCustomer } from '@/types/admin-customer';

/** The Customers page's two downloads, with the same toast as the orders export. */
export function useCustomersExport() {
  const download = useCsvDownload();
  const { toast } = useToast();

  const exportCustomers = useCallback(
    (customers: AdminCustomer[]) => {
      download(customersToCsv(customers), csvFilename('customers', new Date()));
      toast({ title: 'Export ready', description: `${customers.length} customers written to a CSV file.` });
    },
    [download, toast],
  );

  const exportMailingList = useCallback(
    (customers: AdminCustomer[]) => {
      const optedIn = customers.filter((c) => c.isMarketingOptIn && c.email !== '').length;
      download(mailingListToCsv(customers), csvFilename('mailing-list', new Date()));
      toast({
        title: 'Mailing list ready',
        description: `${optedIn} people who said yes to marketing emails. Delete the file once it is uploaded.`,
      });
    },
    [download, toast],
  );

  return { exportCustomers, exportMailingList };
}
