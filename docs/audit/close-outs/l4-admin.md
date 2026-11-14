# Close-out: L4 admin UI

**Commit:** `4efa47d`. **Verification:** at `9e58dc2`, every item passes except two that were deferred, M-028 and M-031. The W-07 hook split was finished in the verification fixes.

## What changed
- **M-001, health.** A system health card. The failed emails list (M-010) and the stuck-pending alert (M-002) are part of it.
- **M-026, MFA (D4).**
  - The admin can add a second TOTP factor.
  - A factor can be removed only while another verified factor remains.
- **M-006, the refund dialog.**
  - A pending marker.
  - A single submit.
  - Recorded refunds are marked as such (`isRecorded`).
- **M-017, bulk status changes.** A confirm step that shows how many customers will be emailed (`preview_status_emails`).
- **Counter sales.**
  - Totals and out-of-stock names (M-022).
  - A same-day void and a manual refund (M-033).
  - A prompt to untick "in stock" after the sale (M-038, D1).
- **M-029, store rates.** Bounds, a confirm step and a history.
- **M-018, photos.** A restore list for photos waiting on the sweep.
- **M-028, safer import.**
  - An `updated_at` check.
  - A blank Images cell leaves the images unchanged.
  - Price bounds.
- **M-042, publish warnings.** A warning when a product is about to be published with something missing.
- **Product edits and safety.**
  - Optimistic locking on product edits (M-032).
  - A discard prompt for unsaved changes (M-036).
  - The slug locks once a product is published (M-039).
  - Partial writes report which items failed (M-034, M-040).
  - The password change sends the current password (M-041).
  - Archive has undo, and bulk actions confirm first (M-037).
- **M-027, revenue.** It counts partially refunded orders.
- **M-030, cancelling a paid order.** It now points the admin to the refund.
- **M-035, the unmatched payments card.**
  - An error state, with retry.
  - Undo.
  - "Show handled".
- **M-044 and M-056.** Card-size copies of product images on upload. The admin sign-in sends a captcha token.

## Deferred, and why
- **M-031, the dashboard reads every order.** The aggregate RPC goes with the L3 follow-up. It is fine at launch volume.
- **M-028, an undo for an import.** It needs an import history table, which is new scope. The safety parts are done.

## Noticed, not touched
- **The BotCheck widget's theme.** It shows the light theme on the dark admin pages. Cosmetic.
- **Long functions, mostly components.** Of the 64 functions over 80 lines, most are admin components: InquiriesTable, OrdersToolbar, ServiceQuoteForm and others. None is in `lib`, `data` or `hooks`.
- **QuoteSent** sits inside `ServiceQuoteForm.tsx`.
- **Shared auth plumbing (W-04).** The customer and admin auth plumbing is still duplicated.

## Do not re-audit
- The MFA factor rules.
- The refund and void flows.
- The bulk status preview.
- The rate bounds and history.
- The optimistic lock.
- The slug lock.
- The partial-write reporting.

## Rejected on merit
- **P-08, MFA recovery codes:** rejected under D4, which uses a second factor plus a documented developer reset.
- **P-05, a slug redirect table:** new scope. M-039 locks the slug instead.
- **P-07, an invite-admin screen:** new scope. Invites stay a runbook step.
- **P-06, an age check on counter sales:** needs a legal and product decision from Alan. Nothing is assumed about the law.
- **P-02, moving a fully refunded order to another status:** needs a business rule from Alan or Phil.

## Hosted
- Turn on Secure password change.
- Turn on Auth CAPTCHA, but only after this admin build is deployed.
