import type { LookedUpOrder } from '@/types/order-lookup';

/** Customer accounts (migration 034). Admin auth types are in auth.ts. */

export type CustomerProfile = {
  fullName: string;
  phone: string;
  isMarketingOptIn: boolean;
  /** When they said yes to marketing email; null when they have not. */
  marketingOptInAt: string | null;
  createdAt: string;
};

export type ProfileInput = { fullName: string; phone: string };

export type SignUpInput = { fullName: string; email: string; password: string };

export type SignInInput = { email: string; password: string };

/** The two kinds of emailed link a customer can arrive from. */
export type CustomerLinkType = 'email' | 'recovery';

/** An emailed code and the address it went to. */
export type EmailCodeInput = { email: string; code: string };

/** The "Download my data" file: everything the account holds about them. */
export type CustomerDataExport = {
  exportedAt: string;
  email: string;
  profile: CustomerProfile | null;
  orders: LookedUpOrder[];
};
