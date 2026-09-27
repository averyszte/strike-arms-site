import { z } from 'zod';

import { loadErrorMessage } from '@/lib/load-error-message';

/**
 * Admin password rules, mirrored from the Supabase Auth policy
 * (supabase/config.toml, and the same values on the hosted project) so a form
 * can say what is wrong before the request is sent. The two must agree: a
 * looser form sends passwords Supabase refuses, a stricter one refuses
 * passwords Supabase would take.
 */
export const MIN_PASSWORD_LENGTH = 12;

export const PASSWORD_HINT =
  'At least 12 characters, with an uppercase letter, a lowercase letter and a number.';

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters`)
  .regex(/[a-z]/, 'Add a lowercase letter')
  .regex(/[A-Z]/, 'Add an uppercase letter')
  .regex(/\d/, 'Add a number');

export const newPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Type the password again'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'The two passwords do not match',
    path: ['confirmPassword'],
  });

export type NewPasswordInput = z.infer<typeof newPasswordSchema>;

function errorCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code: unknown }).code);
  }
  return '';
}

/**
 * Turn a Supabase password-update error into something the admin can act on.
 * The codes are the ones Supabase Auth returns; anything else keeps its own
 * message rather than a generic "try again".
 */
export function passwordUpdateError(error: unknown): string {
  switch (errorCode(error)) {
    case 'weak_password':
      return `That password does not meet the rules. ${PASSWORD_HINT}`;
    case 'same_password':
      return 'The new password must be different from the current one.';
    case 'insufficient_aal':
      return 'Enter a code from your authenticator app first, then set the password.';
    default:
      return `The password was not changed. ${loadErrorMessage(error)}`;
  }
}
