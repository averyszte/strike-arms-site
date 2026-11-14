# Close-out: L2 messaging

**Commit:** `8dc5ed4`.

**Verification:** at `9e58dc2`, M-011 to M-014 pass. M-010 was partly done; migration 049 completes it.

## What changed
- **M-010 and M-016, the notification worker.**
  - Its job processing is split out.
  - Resend errors are classed as retryable or permanent.
  - Jobs dead-letter after 8 attempts (046).
  - There is an `owner.health_digest` template (M-001).
  - Verification fix: the email-queue health check also counts jobs past 5 attempts that have not yet failed (049).
- **M-011, the client IP.** It comes from `cf-connecting-ip`, not the left-most `X-Forwarded-For`.
- **M-012, Turnstile.** It fails closed:
  - with no secret, or no `SITE_HOSTNAME` on the hosted project, it refuses;
  - it honours `ALLOW_INSECURE_NO_CAPTCHA` only on the local stack;
  - it counts failures under `turnstile:fail` for the health check.
- **M-013, delete-account.**
  - It is rate limited per account and per address.
  - An admin account is refused before the password check.
- **M-014, CORS.** Origins come from `ALLOWED_ORIGINS`. Localhost is allowed only on the local stack.
- **Shared code.**
  - Supabase caller helpers.
  - `MissingSecretError`.

## Deferred, and why
- **`resend_notification` for inquiries.**
  - Order emails can be resent from the admin; inquiry emails cannot yet.
  - It needs an RPC and an admin button. That is new scope, so it is a follow-up.

## Noticed, not touched
- **M-011 on the hosted gateway.** An echo test (hosted steps, stage 7) confirms which header is the real client. The code already prefers `cf-connecting-ip`.

## Do not re-audit
- The Turnstile paths that fail closed.
- The order of the limits: per-address before the token, per-email after.
- The CORS list.
- The worker's retry classes.

## Rejected on merit
- None.

## Hosted
- **Set before the deploy:** `ALLOWED_ORIGINS` and `SITE_HOSTNAME`. Without them, checkout returns 500.
- **Remove:** `ALLOW_INSECURE_NO_CAPTCHA` must be absent.
