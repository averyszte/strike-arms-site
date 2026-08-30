import { useCallback, useState } from 'react';

import { listOrdersForExport } from '@/data/orders-export-repository';
import { useCsvDownload } from '@/hooks/use-csv-download';
import { buildOrdersCsv, ordersCsvFilename } from '@/lib/orders-csv';
import type { OrderListFilters } from '@/types/order';

/**
 * Downloads the current view as a CSV.
 *
 * A selection is narrowed from the full export rather than exported straight
 * from the table, because the rows in the table carry no line items — an
 * export of four orders would otherwise have an empty Items column while an
 * export of all of them did not.
 */
export function useOrdersExport() {
  const [isExporting, setIsExporting] = useState(false);
  const download = useCsvDownload();

  const exportOrders = useCallback(
    async (filters: OrderListFilters, onlyIds?: string[]) => {
      setIsExporting(true);
      try {
        const all = await listOrdersForExport(filters);
        const wanted = onlyIds?.length ? new Set(onlyIds) : null;
        const orders = wanted ? all.filter((order) => wanted.has(order.id)) : all;

        download(buildOrdersCsv(orders), ordersCsvFilename(new Date()));
        return orders.length;
      } finally {
        setIsExporting(false);
      }
    },
    [download],
  );

  return { exportOrders, isExporting };
}
