import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateInquiryStatus } from '@/data/inquiries-repository';
import { ADMIN_KEYS } from '@/lib/query-keys';
import type { InquiryStatus } from '@/types/inquiry';

export function useUpdateInquiryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: InquiryStatus }) =>
      updateInquiryStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.inquiriesRoot });
    },
  });
}
