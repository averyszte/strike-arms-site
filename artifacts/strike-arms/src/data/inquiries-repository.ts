import { functionErrorMessage } from '@/data/function-error-message';
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

/** An error whose message came from the server and is safe to show. */
export class InquiryError extends Error {}

/**
 * Files a contact-form or quote-form message, through the submit-inquiry Edge
 * Function. The browser cannot write to the table itself (036); the function
 * checks the bot token, the rate limits and the field lengths first.
 */
export async function createInquiry(input: CreateInquiryInput): Promise<void> {
  const { error } = await supabase.functions.invoke<unknown>('submit-inquiry', {
    body: input,
  });

  // A refusal (bot check, too many tries, a field too long) carries a message
  // for the person. Anything else has none, and the form shows its own.
  if (error) throw new InquiryError(await functionErrorMessage(error, ''));
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
