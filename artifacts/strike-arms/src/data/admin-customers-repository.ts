/**
 * The admin Customers page's one read: admin_customers() (053), which checks
 * for an admin with two-factor itself, because the emails and sign-in dates
 * come from auth.users.
 */
import { supabase } from '@/data/supabase-client';
import type { AdminCustomer } from '@/types/admin-customer';
import type { Database } from '@/types/database';

type CustomerRow = Database['public']['Functions']['admin_customers']['Returns'][number];

function toCustomer(row: CustomerRow): AdminCustomer {
  return {
    userId: row.user_id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    isMarketingOptIn: row.marketing_opt_in,
    createdAt: row.created_at,
    emailConfirmedAt: row.email_confirmed_at,
    lastSignInAt: row.last_sign_in_at,
    orderCount: row.order_count,
    // bigint can arrive as a string; the totals here are far below 2^53.
    spentCents: Number(row.spent_cents),
    lastOrderAt: row.last_order_at,
  };
}

/** Newest account first. */
export async function listCustomers(): Promise<AdminCustomer[]> {
  const { data, error } = await supabase.rpc('admin_customers');
  if (error) throw error;
  return (data ?? []).map(toCustomer);
}
