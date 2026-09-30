import { useMutation } from '@tanstack/react-query';

import { signInCustomer } from '@/data/customer-auth-repository';
import type { SignInInput } from '@/types/customer-account';

export function useCustomerSignIn() {
  return useMutation({
    mutationFn: ({ email, password }: SignInInput) => signInCustomer(email, password),
  });
}
