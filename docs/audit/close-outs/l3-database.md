# Close-out: L3 database

**Commits:** `5e2c8f4` (migrations 040 to 048), plus migration 049 from the verification fixes.

**Verification:** at `9e58dc2`, every item passed except M-021, which was partly done. Migration 049 completes M-021 and the SQL part of M-010.

**Not yet applied:** none of these migrations has run anywhere. The SQL is the source of truth for the RPC signatures.

## What changed
- **040, payments integrity:**
  - order numbers are `SA-YYYY-NNNN` and never truncated (M-015);
  - Stripe events have processing, done and failed states (M-002);
  - an abandoned order that is then paid is flagged (M-003);
  - a daily job abandons orphan pending web orders.
- **041, refund ledger:**
  - the `order_refunds` table and `record_stripe_refund`;
  - RPCs for a manual refund and for a same-day counter void (M-006, M-033).
- **042, outbox reliability:**
  - a guarded enqueue, so an email can never roll back a payment (M-016);
  - status emails wait 5 minutes, are withdrawn if the status moves on, and go once per status (M-017).
- **043, admin safety:**
  - invites promote only fresh invites (M-020);
  - the guest order claim needs a real confirmation (M-021);
  - the `store_settings` row cannot be deleted (M-023);
  - store rates have bounds and a history (M-029);
  - small hardening (M-024): the storage list policy, AAL2 on `applied_migrations()`, and pinned search paths.
- **044, counter sale guards:**
  - archived products are refused;
  - each line is capped at 50;
  - out-of-stock items are named (M-022).
- **045, image sweep:**
  - a 30-day grace period before the sweep deletes a photo, and a restore (M-018);
  - the cron job reads the key from Vault, and the existing job is rescheduled on push (M-019).
- **046, outbox worker:**
  - jobs dead-letter after 8 attempts, with backoff and a timeout;
  - a preview of how many customers a bulk status change will email.
- **047:** the `catalogue_counts` view (M-051).
- **048, health checks (M-001):**
  - `system_health_checks()`;
  - `system_health()` for admins;
  - a daily owner digest.
- **049, verification fixes:**
  - the guest order claim also requires the order to predate the email confirmation (M-021, defence in depth). Behaviour change: a guest order placed after the customer confirmed their account is no longer linked automatically. Alan links it by hand;
  - the email-queue health check counts `pending` jobs past 5 attempts, which are still retrying, and warns on any (M-010). Dead-lettered jobs are already covered by the failed emails list.
- **M-025:** the price rule check was verified in place. It has been there since 001 and never dropped.

## Deferred, and why
- **M-031, an aggregate RPC for the dashboard.** It needs new SQL and an admin rewrite, and launch volume does not need it.
- **M-028, an import undo table.** The import already does three things that cover most of the risk:
  - it writes only the fields that changed;
  - it warns when the export is stale;
  - it shows a full preview first.

  An undo table is new scope.
- **The archive flags.** They stay as they are, with no schema change.

## Noticed, not touched
- **M-024's wording.** The text in findings.md has the item the wrong way round. The verifier followed the source audit, and the migration matches the source.
- **Order search indexes (P-04).** Not needed at this volume. Revisit at about 5,000 orders.

## Do not re-audit
- Order numbers.
- The event states.
- The refund ledger.
- The outbox guard and the 5-minute hold.
- The invite trigger.
- The settings guards.
- The sweep grace period.
- The Vault key.

## Rejected on merit
- **P-09, stock counting:** rejected under D1, because stock is a manual tick.
- **P-01, a server-side `is_open` gate:** rejected under D5.

## Hosted
1. Run `supabase db push` before any function deploy.
2. Check the 045 notice in the push output.
3. Confirm the key is gone from `cron.job`, then rotate it.
4. Run `system_health_checks()` and `verify-rls.sql`.
