export type InquiryStatus = 'new' | 'replied' | 'archived';

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: InquiryStatus;
  consent: boolean;
  sourcePage: string | null;
  createdAt: string;
};

export type CreateInquiryInput = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  consent: boolean;
  sourcePage?: string;
};
