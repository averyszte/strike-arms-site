/** One customer account on the admin Customers page (admin_customers(), 053/054). */
export interface AdminCustomer {
  userId: string;
  /** Empty for the rare account with no email (phone sign-in). */
  email: string;
  fullName: string;
  phone: string;
  isMarketingOptIn: boolean;
  /** When they said yes to marketing emails; the consent record. */
  marketingOptInAt: string | null;
  createdAt: string;
  /** Null until they click the link in the confirmation email. */
  emailConfirmedAt: string | null;
  lastSignInAt: string | null;
  /**
   * Paid, partially refunded and refunded orders, including guest orders
   * under the same confirmed email that were never linked to the account.
   */
  orderCount: number;
  /** Net of refunds. */
  spentCents: number;
  lastOrderAt: string | null;
}

/** The figures across the top of the Customers page. */
export interface CustomerStats {
  total: number;
  newLast30Days: number;
  newPrevious30Days: number;
  confirmed: number;
  marketingOptIns: number;
  /** Accounts with at least one order. */
  withOrders: number;
  /** Accounts with two or more orders. */
  repeat: number;
  spentCents: number;
  /**
   * The middle spend among customers who spent anything. A median, because
   * one big order would drag an average around at this shop's size.
   */
  medianSpendCents: number;
}

export interface MonthlySignups {
  /** e.g. "Nov 2026". */
  label: string;
  count: number;
}

export type CustomerSort = 'newest' | 'spent' | 'orders' | 'last-sign-in';
