import { useSearch } from 'wouter';

import { productEnquirySubject } from '@/lib/product-enquiry-subject';

/** The subject to start the contact form with, from a product page's "Ask us" link. */
export function useProductEnquirySubject(): string {
  return productEnquirySubject(useSearch());
}
