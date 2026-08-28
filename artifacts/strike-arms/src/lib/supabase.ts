import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { verifySupabaseConfig } from '@/lib/verify-supabase-config';

const url = import.meta.env.VITE_SUPABASE_URL ?? '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

verifySupabaseConfig(url, anonKey);

export const supabase = createClient<Database>(url, anonKey);
