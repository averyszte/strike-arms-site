import { useMutation } from '@tanstack/react-query';

import {
  confirmSignUpCode,
  resendSignUpCode,
  signUpCustomer,
} from '@/data/customer-auth-repository';
import type { EmailCodeInput, SignUpInput } from '@/types/customer-account';

/** Create the account, then confirm the email with the code it was sent. */
export function useCustomerSignUp() {
  const signUp = useMutation({
    mutationFn: (input: SignUpInput) => signUpCustomer(input),
  });
  const confirmCode = useMutation({
    mutationFn: ({ email, code }: EmailCodeInput) => confirmSignUpCode(email, code),
  });
  const resendCode = useMutation({
    mutationFn: (email: string) => resendSignUpCode(email),
  });
  return { signUp, confirmCode, resendCode };
}
