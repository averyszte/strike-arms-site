import type { HealthStatus } from '@/types/database-admin';

export type HealthCheck = { name: string; status: HealthStatus; detail: string };

const RANK: Record<HealthStatus, number> = { fail: 0, warn: 1, ok: 2 };

/** The worst status across the checks; 'ok' for an empty list. */
export function overallHealth(checks: HealthCheck[]): HealthStatus {
  return checks.reduce<HealthStatus>(
    (worst, check) => (RANK[check.status] < RANK[worst] ? check.status : worst),
    'ok',
  );
}

/** Failures first, then warnings, then the rest by name. */
export function sortHealthChecks(checks: HealthCheck[]): HealthCheck[] {
  return [...checks].sort((a, b) => RANK[a.status] - RANK[b.status] || a.name.localeCompare(b.name));
}

/** "cron_jobs_active" reads as "Cron jobs active". */
export function healthCheckLabel(name: string): string {
  const words = name.replace(/[_:]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
