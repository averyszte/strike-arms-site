import { keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createInquiry, listInquiries, updateInquiryStatus } from '@/data/inquiries-repository';
import { INQUIRIES_PAGE_SIZE } from '@/lib/inquiries-paging';
import type { CreateInquiryInput, InquiryStatus } from '@/types/inquiry';

export function useInquiries(status?: InquiryStatus, limit = INQUIRIES_PAGE_SIZE) {
  return useQuery({
    queryKey: ['admin', 'inquiries', status, limit],
    queryFn: () => listInquiries(status, limit),
    // Keeps the rows on screen while "Load more" fetches, instead of a spinner.
    placeholderData: keepPreviousData,
  });
}

export function useSubmitInquiry() {
  return useMutation({
    mutationFn: (input: CreateInquiryInput) => createInquiry(input),
  });
}

export function useUpdateInquiryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: InquiryStatus }) =>
      updateInquiryStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'inquiries'] });
    },
  });
}
