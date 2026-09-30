import { useMutation } from '@tanstack/react-query';

import {
  confirmRecoveryCode,
  requestCustomerPasswordReset,
  updateCustomerPassword,
} from '@/data/customer-auth-repository';
import type { EmailCodeInput } from '@/types/customer-account';

/** Ask for a reset email, enter its code (which signs in), then set the password. */
export function useCustomerPasswordReset() {
  const request = useMutation({
    mutationFn: (email: string) => requestCustomerPasswordReset(email),
  });
  const confirmCode = useMutation({
    mutationFn: ({ email, code }: EmailCodeInput) => confirmRecoveryCode(email, code),
  });
  const setPassword = useMutation({
    mutationFn: (password: string) => updateCustomerPassword(password),
  });
  return { request, confirmCode, setPassword };
}
