import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

/** A contact form or service quote (039), read fresh when the email is sent. */
export type EmailInquiry = {
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  sourcePage: string | null;
  createdAt: string;
};

export async function loadEmailInquiry(
  admin: SupabaseClient,
  inquiryId: string,
): Promise<EmailInquiry> {
  const { data: row, error } = await admin
    .from("inquiries")
    .select("name, email, phone, subject, message, source_page, created_at")
    .eq("id", inquiryId)
    .single();

  if (error || !row) throw new Error(`Inquiry ${inquiryId} not found: ${error?.message ?? ""}`);

  return {
    name: row.name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    sourcePage: row.source_page,
    createdAt: row.created_at,
  };
}
