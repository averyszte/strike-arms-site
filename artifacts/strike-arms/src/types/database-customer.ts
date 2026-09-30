import type { Json } from '@/types/database-rows';

/**
 * Customer accounts (migration 034), intersected into Database in
 * database.ts. Kept apart so that file stays under the size limit.
 */

export type CustomerProfileRow = {
  user_id: string;
  full_name: string;
  phone: string;
  marketing_opt_in: boolean;
  marketing_opt_in_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomerTables = {
  customer_profiles: {
    Row: CustomerProfileRow;
    // Made by the handle_new_customer trigger, never by the browser.
    Insert: never;
    // The column grant allows these two only; marketing goes through
    // set_marketing_opt_in so its timestamp is stamped by the database.
    Update: Partial<Pick<CustomerProfileRow, 'full_name' | 'phone'>>;
    Relationships: [];
  };
};

export type CustomerFunctions = {
  // The caller's paid orders, in the order-lookup shape. Staff-only fields
  // are left out by the function, not by the client.
  my_orders: { Args: Record<PropertyKey, never>; Returns: Json };
  // Links guest orders placed with the caller's confirmed email.
  claim_my_guest_orders: { Args: Record<PropertyKey, never>; Returns: number };
  set_marketing_opt_in: { Args: { p_opt_in: boolean }; Returns: undefined };
};
