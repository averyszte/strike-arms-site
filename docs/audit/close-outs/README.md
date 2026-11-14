# Lane close-outs: pre-launch audit (2026-11-14)

There is one close-out per fix lane. Each uses the All Blooms format from `docs/audit/audit-plan.md`:
- what changed;
- what was deferred, and why;
- what was noticed but not touched;
- what not to re-audit;
- what was rejected on merit.

The finding IDs (M-xxx, W-xx, P-xx) are in `docs/audit/findings.md`. The hosted steps are in `docs/audit/hosted-steps.md`.

## Verification

A fresh read-only pass re-checked every fixed finding at commit `9e58dc2`. The first result:
- **M items:** 57 PASS, 5 PARTLY, 0 FAIL, 2 DEFERRED (M-028, M-031), 1 N/A (M-055, an empty placeholder).
- **W items:** 6 PASS, 2 PARTLY, 0 FAIL, 5 DEFERRED.
- **Regressions:** none. Every TypeScript and edge call to a new RPC matches its signature in migrations 040 to 048.

The verification fix commit then closed the PARTLY items: M-010, M-021, M-049, M-050, M-051, M-065, W-05 and W-07. Each lane's file names its own.

## Not covered
- **Edge functions:** these were checked by reading only. Deno is not installed locally, and the CI deno check is advisory.
- **Migrations 040 to 049:** none is applied anywhere yet. They apply when Phil runs `supabase db push`.
- **The A5 failure scenarios in Stripe test mode:** these need the hosted stack. They are stage 7 of the hosted steps.

## Files

| Lane | File |
|---|---|
| L1 Money path | [l1-money-path.md](l1-money-path.md) |
| L2 Messaging | [l2-messaging.md](l2-messaging.md) |
| L3 Database | [l3-database.md](l3-database.md) |
| L4 Admin UI | [l4-admin.md](l4-admin.md) |
| L5 Storefront | [l5-storefront.md](l5-storefront.md) |
| L6 Platform | [l6-platform.md](l6-platform.md) |
| Wave 3 refactors | [wave-3.md](wave-3.md) |
