/**
 * A signed-in customer's own data: their profile row (RLS, own row only) and
 * their orders (my_orders(), which leaves out staff notes, Stripe ids and the
 * address). Deleting the account goes through the delete-account Edge
 * Function, because only the service role can delete an auth user.
 */
import { supabase } from '@/lib/supabase';
import { toLookedUpOrder } from '@/data/order-lookup-repository';
import type { CustomerProfile, ProfileInput } from '@/types/customer-account';
import type { CustomerProfileRow } from '@/types/database-customer';
import type { LookedUpOrder } from '@/types/order-lookup';

function toProfile(row: CustomerProfileRow): CustomerProfile {
  return {
    fullName: row.full_name,
    phone: row.phone,
    isMarketingOptIn: row.marketing_opt_in,
    marketingOptInAt: row.marketing_opt_in_at,
    createdAt: row.created_at,
  };
}

/** Null only for an account made before 034 backfilled every profile. */
export async function fetchCustomerProfile(userId: string): Promise<CustomerProfile | null> {
  const { data, error } = await supabase
    .from('customer_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? toProfile(data) : null;
}

export async function updateCustomerProfile(userId: string, input: ProfileInput): Promise<void> {
  const { error } = await supabase
    .from('customer_profiles')
    .update({ full_name: input.fullName, phone: input.phone })
    .eq('user_id', userId);
  if (error) throw error;
}

export async function setMarketingOptIn(isOptedIn: boolean): Promise<void> {
  const { error } = await supabase.rpc('set_marketing_opt_in', { p_opt_in: isOptedIn });
  if (error) throw error;
}

/**
 * Links guest orders placed with this account's email. Safe to call on every
 * visit: it only takes unclaimed orders, and only once the email is confirmed.
 */
export async function claimGuestOrders(): Promise<number> {
  const { data, error } = await supabase.rpc('claim_my_guest_orders');
  if (error) throw error;
  return typeof data === 'number' ? data : 0;
}

/** Newest first. */
export async function fetchMyOrders(): Promise<LookedUpOrder[]> {
  const { data, error } = await supabase.rpc('my_orders');
  if (error) throw error;
  return Array.isArray(data) ? data.map(toLookedUpOrder) : [];
}

/**
 * The Edge Function checks the password again before deleting, so a session
 * left open on a shared computer is not enough to delete the account.
 */
export async function deleteCustomerAccount(password: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke<unknown>('delete-account', {
    body: { password },
  });
  // A refusal (an admin account, a dead session) is a non-2xx, so it lands here too.
  if (error) throw new Error('The account was not deleted. Try again, or contact the shop.');

  const body = (data ?? {}) as { deleted?: unknown; reason?: unknown };
  if (body.reason === 'wrong_password') throw new Error('That password is not right.');
  if (body.deleted !== true) throw new Error('The account was not deleted. Try again, or contact the shop.');

  // The user is gone on the server; this clears the dead session here.
  await supabase.auth.signOut({ scope: 'local' });
}
