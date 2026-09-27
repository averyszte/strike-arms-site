import { supabase } from '@/lib/supabase';
import { INQUIRIES_PAGE_SIZE } from '@/lib/inquiries-paging';
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

/**
 * The most recent `limit` inquiries, plus the total that match. "Load more"
 * raises the limit rather than fetching a second page, so the list never has
 * to be stitched together on the client.
 */
export async function listInquiries(
  status?: InquiryStatus,
  limit = INQUIRIES_PAGE_SIZE,
): Promise<{ items: Inquiry[]; total: number }> {
  let query = supabase
    .from('inquiries')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query.range(0, limit - 1);
  if (error) throw error;
  return { items: (data ?? []).map(rowToInquiry), total: count ?? 0 };
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
