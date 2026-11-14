import { useQuery } from '@tanstack/react-query';

import { fetchStoreRatesHistory } from '@/data/settings-repository';
import { ADMIN_KEYS } from '@/lib/query-keys';

/** The last rate changes, for the history list under the form (M-029). */
export function useStoreRatesHistory() {
  return useQuery({ queryKey: ADMIN_KEYS.storeRatesHistory, queryFn: () => fetchStoreRatesHistory() });
}
