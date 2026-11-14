import { supabase } from '@/data/supabase-client';
import type { HealthCheck } from '@/lib/system-health';

/**
 * The checks in system_health() (048): cron, Vault, the email outbox, stuck
 * payments, webhook freshness and the rest. AAL2 only; a 42501 is passed up
 * as an error like any other, because the dashboard cannot be reached
 * without AAL2 anyway.
 */
export async function fetchSystemHealth(): Promise<HealthCheck[]> {
  const { data, error } = await supabase.rpc('system_health');
  if (error) throw new Error(error.message);
  return (data ?? []).map(row => ({ name: row.check_name, status: row.status, detail: row.detail }));
}
