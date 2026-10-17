import { useState } from 'react';

import type { Product } from '@/types/product';

/** Which of the products screen's sheets and dialogs is open. */
export function useProductsDialogs() {
  const [editing, setEditing] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  return {
    editing,
    isAdding,
    isImporting,
    edit: setEditing,
    add: () => setIsAdding(true),
    importCsv: () => setIsImporting(true),
    close: () => {
      setEditing(null);
      setIsAdding(false);
      setIsImporting(false);
    },
  };
}
