import { SiteLayout } from '@/components/SiteLayout';
import { CatalogLoadError } from '@/components/catalog/CatalogLoadError';

/** A whole storefront page whose data failed to load: a product or a brand. */
export function CatalogLoadErrorPage(props: {
  what: string;
  isRetrying?: boolean;
  onRetry: () => void;
}) {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <CatalogLoadError {...props} />
      </div>
    </SiteLayout>
  );
}
