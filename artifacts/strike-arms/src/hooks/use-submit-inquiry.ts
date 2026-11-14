import { useMutation } from '@tanstack/react-query';

import { createInquiry, InquiryError } from '@/data/inquiries-repository';
import type { CreateInquiryInput } from '@/types/inquiry';

export function useSubmitInquiry() {
  const mutation = useMutation({
    mutationFn: (input: CreateInquiryInput) => createInquiry(input),
  });

  const { error } = mutation;
  const errorMessage =
    error instanceof InquiryError && error.message
      ? error.message
      : 'That did not send. Please try again.';

  return { ...mutation, errorMessage };
}
