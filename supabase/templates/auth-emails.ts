import {
  button,
  codeBox,
  layout,
  note,
  paragraph,
} from "../functions/notification-worker/templates/layout.ts";

/**
 * The Supabase Auth emails, in the same design as the order emails. Supabase
 * fills the {{ .Token }}-style fields when it sends, so they pass through the
 * layout as plain text. render.ts writes each one to <file>.html for pasting
 * into Dashboard > Authentication > Emails (docs/admin-auth-emails.md).
 */

export type AuthEmail = {
  file: string;
  /** The template's name in Dashboard > Authentication > Emails. */
  dashboardName: string;
  subject: string;
  html: string;
};

const confirmation: AuthEmail = {
  file: "confirmation",
  dashboardName: "Confirm sign up",
  subject: "Confirm your Strike Arms account",
  html: layout({
    preheader: "Your code is {{ .Token }}. It works once and expires within an hour.",
    heading: "Confirm your email",
    body:
      paragraph("Thanks for creating an account. Enter this code on the page you signed up on:") +
      codeBox("{{ .Token }}") +
      paragraph("Or confirm with one click:") +
      button("Confirm my email", "{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email") +
      paragraph("Once it is confirmed, any orders you placed as a guest with this email are added to your account.") +
      note("The code and button work once and expire within an hour. If you did not create an account, ignore this email. Nothing happens unless it is confirmed."),
  }),
};

const recovery: AuthEmail = {
  file: "recovery",
  dashboardName: "Reset password",
  subject: "Reset your Strike Arms password",
  html: layout({
    preheader: "Choose a new password. The link expires within an hour.",
    heading: "Reset your password",
    body:
      paragraph("Someone asked to reset the password for this account. Choose a new one here:") +
      button("Choose a new password", "{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery") +
      paragraph("If the reset page asks for a code, enter this one:") +
      codeBox("{{ .Token }}") +
      paragraph("If two-factor authentication is set up on the account, you will be asked for a code from your authenticator app first.") +
      note("The code and link work once and expire within an hour. If they have expired, ask for another from the sign-in page. If you did not ask for this, ignore it: your password has not changed."),
  }),
};

const invite: AuthEmail = {
  file: "invite",
  dashboardName: "Invite user",
  subject: "Your Strike Arms admin invite",
  html: layout({
    preheader: "Set your password to start managing orders, products and stock.",
    eyebrow: "Admin access",
    heading: "You have been invited to the Strike Arms admin",
    body:
      paragraph("You have been given access to the shop's admin, where orders, products and stock are managed.") +
      paragraph("Set your password first. You will then set up two-factor authentication with an authenticator app on your phone, such as Google Authenticator or Microsoft Authenticator.") +
      button("Set your password", "{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite") +
      note("The link works once and expires, so use it soon. If it has expired, ask for a new invite. If you were not expecting this, ignore it."),
  }),
};

const emailChange: AuthEmail = {
  file: "email-change",
  dashboardName: "Change email address",
  subject: "Confirm your new Strike Arms email",
  html: layout({
    preheader: "Confirm the change to the email on your Strike Arms account.",
    heading: "Confirm your email change",
    body:
      paragraph("Someone asked to change the email on your Strike Arms account from {{ .Email }} to {{ .NewEmail }}.") +
      paragraph("We send this to both addresses. The change goes through once it is confirmed from both.") +
      button("Confirm the change", "{{ .ConfirmationURL }}") +
      note("If you did not ask for this, do not confirm it, and change your password from your account page."),
  }),
};

export const AUTH_EMAILS: AuthEmail[] = [confirmation, recovery, invite, emailChange];
