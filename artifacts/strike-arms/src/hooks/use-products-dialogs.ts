import { useState } from 'react';

import type { Product } from '@/types/product';

/** Which of the products screen's sheets and dialogs is open. */
export function useProductsDialogs() {
  const [editing, setEditing] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  return {
    editing,
    isAdding,
    adjusting,
    isImporting,
    edit: setEditing,
    adjustStock: setAdjusting,
    add: () => setIsAdding(true),
    importCsv: () => setIsImporting(true),
    close: () => {
      setEditing(null);
      setIsAdding(false);
      setAdjusting(null);
      setIsImporting(false);
    },
  };
}
