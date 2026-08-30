/**
 * One thing on the admin dashboard that needs a human to do something.
 *
 * Lives in types rather than beside the builder because more than one lib
 * builds these now -- shop operations in admin-alerts, deployment state in
 * migration-alerts -- and neither should have to import the other to say what
 * shape it returns.
 */

export type AlertSeverity = 'critical' | 'warning';

export type OperationalAlert = {
  id: string;
  severity: AlertSeverity;
  count: number;
  /** What is wrong. */
  title: string;
  /** What to do about it, and where the link goes. */
  action: string;
  href: string;
};
