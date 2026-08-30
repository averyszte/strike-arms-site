import { Helmet } from 'react-helmet-async';
import { MigrationStatusPanel } from '@/components/admin/MigrationStatusPanel';
import { StoreRatesForm } from '@/components/admin/StoreRatesForm';
import { useStoreRates } from '@/hooks/use-store-rates';

export default function SettingsPage() {
  const { data: rates, isLoading, error } = useStoreRates();

  return (
    <>
      <Helmet>
        <title>Settings | Strike Arms Admin</title>
      </Helmet>

      <h1 className="mb-1 text-xl font-bold text-foreground">Settings</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        These decide what every customer is charged. The cart and the checkout both read them from
        here, so a rate can only be wrong in one place.
      </p>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="h-7 w-7 animate-spin rounded-full border-b-2 border-accent" />
        </div>
      )}

      {/* No fallback rates on screen either: showing a plausible default here
          would let an admin "confirm" numbers the shop is not actually using. */}
      {!isLoading && !rates && (
        <p className="text-sm text-destructive">
          The rates could not be read{error instanceof Error ? `: ${error.message}` : '.'}
        </p>
      )}

      {rates && <StoreRatesForm rates={rates} />}

      <div className="mt-8">
        <MigrationStatusPanel />
      </div>
    </>
  );
}
