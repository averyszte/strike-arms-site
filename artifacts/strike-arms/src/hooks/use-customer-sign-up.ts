import { useMutation } from '@tanstack/react-query';

import {
  confirmSignUpCode,
  resendSignUpCode,
  signUpCustomer,
} from '@/data/customer-auth-repository';
import type { CaptchaInput, EmailCodeInput, SignUpInput } from '@/types/customer-account';

/** Create the account, then confirm the email with the code it was sent. */
export function useCustomerSignUp() {
  const signUp = useMutation({
    mutationFn: ({ captchaToken, ...input }: SignUpInput & CaptchaInput) =>
      signUpCustomer(input, captchaToken),
  });
  const confirmCode = useMutation({
    mutationFn: ({ email, code }: EmailCodeInput) => confirmSignUpCode(email, code),
  });
  const resendCode = useMutation({
    mutationFn: ({ email, captchaToken }: { email: string } & CaptchaInput) =>
      resendSignUpCode(email, captchaToken),
  });
  return { signUp, confirmCode, resendCode };
}
