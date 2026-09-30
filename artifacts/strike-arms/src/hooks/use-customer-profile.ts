import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchCustomerProfile,
  setMarketingOptIn,
  updateCustomerProfile,
} from '@/data/customer-account-repository';
import { CUSTOMER_QUERY_ROOT } from '@/hooks/use-customer-session';
import type { ProfileInput } from '@/types/customer-account';

/** The signed-in customer's profile, and the two ways to change it. */
export function useCustomerProfile(userId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = [CUSTOMER_QUERY_ROOT, 'profile', userId];
  const refresh = () => queryClient.invalidateQueries({ queryKey });

  const profile = useQuery({
    queryKey,
    enabled: userId !== null,
    queryFn: () => fetchCustomerProfile(userId as string),
  });

  const save = useMutation({
    mutationFn: (input: ProfileInput) => updateCustomerProfile(userId as string, input),
    onSuccess: refresh,
  });

  const setMarketing = useMutation({
    mutationFn: (isOptedIn: boolean) => setMarketingOptIn(isOptedIn),
    onSuccess: refresh,
  });

  return { profile, save, setMarketing };
}
