import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import type { Inquiry, InquiryStatus, CreateInquiryInput } from '@/types/inquiry';

type InquiryRow = Database['public']['Tables']['inquiries']['Row'];

function rowToInquiry(row: InquiryRow): Inquiry {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    status: row.status,
    consent: row.consent,
    sourcePage: row.source_page,
    createdAt: row.created_at,
  };
}

/**
 * Files a contact-form message.
 *
 * Returns nothing on purpose. Anon is granted insert and nothing else, and
 * reading the row back would run the select policy, which only an admin
 * passes — so asking for the inserted row would fail for every real visitor
 * while working perfectly for whoever was logged in to test it.
 */
export async function createInquiry(input: CreateInquiryInput): Promise<void> {
  const { error } = await supabase.from('inquiries').insert({
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    subject: input.subject ?? null,
    message: input.message,
    consent: input.consent,
    source_page: input.sourcePage ?? null,
  });

  if (error) throw error;
}

export async function listInquiries(status?: InquiryStatus): Promise<Inquiry[]> {
  let query = supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(rowToInquiry);
}

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
  const { data, error } = await supabase
    .from('inquiries')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToInquiry(data);
}
