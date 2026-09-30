import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@supabase/supabase-js';

import { getCustomerSession, onCustomerAuthChange } from '@/data/customer-auth-repository';

export const CUSTOMER_QUERY_ROOT = 'customer';

type CustomerSession = { user: User | null; isLoading: boolean };

/**
 * Who is signed in, for the storefront. Any signed-in user counts, admins
 * included: an admin who opens /account simply has no orders.
 *
 * Signing out drops every cached customer query, so the next person on the
 * same computer never sees the last one's orders, even for a frame.
 */
export function useCustomerSession(): CustomerSession {
  const queryClient = useQueryClient();
  const [state, setState] = useState<CustomerSession>({ user: null, isLoading: true });

  useEffect(() => {
    let isMounted = true;

    void getCustomerSession().then((session) => {
      if (isMounted) setState({ user: session?.user ?? null, isLoading: false });
    });

    const unsubscribe = onCustomerAuthChange((event, session) => {
      if (event === 'SIGNED_OUT') queryClient.removeQueries({ queryKey: [CUSTOMER_QUERY_ROOT] });
      setState({ user: session?.user ?? null, isLoading: false });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [queryClient]);

  return state;
}
