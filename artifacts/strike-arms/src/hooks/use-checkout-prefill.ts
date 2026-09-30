import { useCustomerProfile } from '@/hooks/use-customer-profile';
import { useCustomerSession } from '@/hooks/use-customer-session';
import type { CheckoutPrefill } from '@/types/cart';

/**
 * The signed-in customer's name, email and phone for the checkout form.
 * Null for a guest, and while the session or profile is still loading. If
 * the profile cannot be read, the email alone still fills in.
 */
export function useCheckoutPrefill(): CheckoutPrefill | null {
  const session = useCustomerSession();
  const userId = session.user?.id ?? null;
  const { profile } = useCustomerProfile(userId);

  if (!session.user?.email || profile.isPending) return null;

  return {
    customerName: profile.data?.fullName ?? '',
    customerEmail: session.user.email,
    customerPhone: profile.data?.phone ?? '',
  };
}
