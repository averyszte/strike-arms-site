import { useMutation } from '@tanstack/react-query';

import { requestPasswordReset } from '@/data/admin-auth-repository';

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
  });
}
