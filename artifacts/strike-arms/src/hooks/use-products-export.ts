import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { listAllProducts } from '@/data/admin-products-repository';
import { ALL_PRODUCTS_KEY } from '@/hooks/use-admin-products';
import { useCsvDownload } from '@/hooks/use-csv-download';
import { buildProductsCsv, productsCsvFilename } from '@/lib/products-csv';

/**
 * Downloads the catalogue as a CSV: every product that is not archived,
 * whatever page or filter is on screen. The file is for editing and importing
 * back, and an import of one page would read as the rest being untouched.
 */
export function useProductsExport() {
  const [isExporting, setIsExporting] = useState(false);
  const qc = useQueryClient();
  const download = useCsvDownload();

  const exportProducts = useCallback(async () => {
    setIsExporting(true);
    try {
      const all = await qc.fetchQuery({ queryKey: ALL_PRODUCTS_KEY, queryFn: listAllProducts });
      const products = all.filter((product) => !product.isArchived);
      download(buildProductsCsv(products), productsCsvFilename(new Date()));
      return products.length;
    } finally {
      setIsExporting(false);
    }
  }, [qc, download]);

  return { exportProducts, isExporting };
}
