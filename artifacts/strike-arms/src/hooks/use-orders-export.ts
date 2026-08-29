import { useCallback, useState } from 'react';

import { listOrdersForExport } from '@/data/orders-export-repository';
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

  const exportOrders = useCallback(
    async (filters: OrderListFilters, onlyIds?: string[]) => {
      setIsExporting(true);
      try {
        const all = await listOrdersForExport(filters);
        const wanted = onlyIds?.length ? new Set(onlyIds) : null;
        const orders = wanted ? all.filter((order) => wanted.has(order.id)) : all;

        downloadCsv(buildOrdersCsv(orders), ordersCsvFilename(new Date()));
        return orders.length;
      } finally {
        setIsExporting(false);
      }
    },
    [],
  );

  return { exportOrders, isExporting };
}

function downloadCsv(csv: string, filename: string) {
  // text/csv rather than octet-stream so a phone can preview it, and the BOM
  // in the body is what actually tells Excel the encoding.
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
