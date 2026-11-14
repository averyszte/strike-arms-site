import { useFormContext, useWatch } from 'react-hook-form';
import { AlertTriangle } from 'lucide-react';

import type { ProductFormValues } from '@/lib/product-form-schema';

/**
 * Shown while the form is ticked Published but the card would go live with no
 * photo or no price (M-042). A warning, not a block: the price may be pending.
 */
export function ProductPublishWarning() {
  const { control } = useFormContext<ProductFormValues>();
  const [isPublished, images, priceEuros] = useWatch({ control, name: ['isPublished', 'images', 'priceEuros'] });
  const missing = [
    images.length === 0 && 'a photo',
    !(parseFloat(priceEuros) > 0) && 'a price',
  ].filter(Boolean);
  if (!isPublished || missing.length === 0) return null;

  return (
    <p className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      Published without {missing.join(' or ')}: it will look broken on the shop.
    </p>
  );
}
