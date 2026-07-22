import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createInquiry, listInquiries, updateInquiryStatus } from '@/data/inquiries-repository';
import type { CreateInquiryInput, InquiryStatus } from '@/types/inquiry';

export function useInquiries(status?: InquiryStatus) {
  return useQuery({
    queryKey: ['admin', 'inquiries', status],
    queryFn: () => listInquiries(status),
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
