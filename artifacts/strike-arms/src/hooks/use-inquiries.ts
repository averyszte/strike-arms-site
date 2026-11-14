import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { listInquiries } from '@/data/inquiries-repository';
import { INQUIRIES_PAGE_SIZE } from '@/lib/inquiries-paging';
import { ADMIN_KEYS } from '@/lib/query-keys';
import type { InquiryStatus } from '@/types/inquiry';

export function useInquiries(status?: InquiryStatus, limit = INQUIRIES_PAGE_SIZE) {
  return useQuery({
    queryKey: ADMIN_KEYS.inquiries(status, limit),
    queryFn: () => listInquiries(status, limit),
    // Keeps the rows on screen while "Load more" fetches, instead of a spinner.
    placeholderData: keepPreviousData,
  });
}
