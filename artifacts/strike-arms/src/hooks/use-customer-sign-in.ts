import { useMutation } from '@tanstack/react-query';

import { signInCustomer } from '@/data/customer-auth-repository';
import type { CaptchaInput, SignInInput } from '@/types/customer-account';

export function useCustomerSignIn() {
  return useMutation({
    mutationFn: ({ email, password, captchaToken }: SignInInput & CaptchaInput) =>
      signInCustomer(email, password, captchaToken),
  });
}
