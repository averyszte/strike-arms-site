import { z } from 'zod';

import { passwordSchema } from '@/lib/password-policy';

/**
 * Form rules for customer accounts. Lengths match the 034 checks on
 * customer_profiles, so the form refuses what the database would.
 */

export const MAX_NAME_LENGTH = 120;
export const MAX_PHONE_LENGTH = 30;

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Enter your email')
  .max(254, 'That email is too long')
  .email('That email address does not look right');

/**
 * One password field with a show toggle rather than a second "type it again"
 * field (N-060): the shopper can check what they typed by looking at it.
 */
export const signUpSchema = z.object({
  fullName: z.string().trim().min(1, 'Enter your name').max(MAX_NAME_LENGTH, 'That name is too long'),
  email: emailSchema,
  password: passwordSchema,
});

export type SignUpFormInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password'),
});

export type SignInFormInput = z.infer<typeof signInSchema>;

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, 'Enter your name').max(MAX_NAME_LENGTH, 'That name is too long'),
  phone: z
    .string()
    .trim()
    .max(MAX_PHONE_LENGTH, 'That number is too long')
    .regex(/^[\d\s()+-]*$/, 'Use digits, spaces and + only'),
});

export const emailOnlySchema = z.object({ email: emailSchema });
