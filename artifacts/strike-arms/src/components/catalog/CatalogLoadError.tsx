import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CTA_SECONDARY_SM } from '@/lib/storefront-styles';

/**
 * What the shop shows when products could not be read.
 *
 * A failed read used to fall through to "No products found" or the 404 page,
 * so a dropped connection told a customer the shop was empty and told a
 * search engine a live product was gone. Neither is true, so this says the
 * load failed and offers a retry. No noindex: the page is real, the request
 * just did not arrive.
 */

type CatalogLoadErrorProps = {
  /** What failed, as it would follow "Could not load". */
  what?: string;
  isRetrying?: boolean;
  onRetry: () => void;
};

export function CatalogLoadError({ what = 'the products', isRetrying = false, onRetry }: CatalogLoadErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center py-24 text-center">
      <AlertTriangle className="mb-4 h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-foreground">
        Could not load {what}
      </p>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        Something went wrong on the way here. Check your connection and try again.
      </p>
      <Button
        type="button"
        variant="outline"
        className={CTA_SECONDARY_SM}
        onClick={onRetry}
        disabled={isRetrying}
      >
        <RefreshCw className={isRetrying ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} aria-hidden="true" />
        {isRetrying ? 'Trying again' : 'Try again'}
      </Button>
    </div>
  );
}
