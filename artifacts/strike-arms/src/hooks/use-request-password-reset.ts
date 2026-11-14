import { useMutation } from '@tanstack/react-query';

import { requestPasswordReset } from '@/data/admin-auth-repository';

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: ({ email, captchaToken }: { email: string; captchaToken: string | null }) =>
      requestPasswordReset(email, captchaToken),
  });
}
