/** One customer account on the admin Customers page (admin_customers(), 053). */
export interface AdminCustomer {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  isMarketingOptIn: boolean;
  createdAt: string;
  /** Null until they click the link in the confirmation email. */
  emailConfirmedAt: string | null;
  lastSignInAt: string | null;
  /** Paid, partially refunded and refunded orders. */
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
  withOrders: number;
  repeat: number;
  spentCents: number;
  /** Spend per customer who has ordered; 0 when nobody has. */
  averageSpendCents: number;
}

export interface MonthlySignups {
  /** e.g. "Nov 2026". */
  label: string;
  count: number;
}

export type CustomerSort = 'newest' | 'spent' | 'orders' | 'last-sign-in';
