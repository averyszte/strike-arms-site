# Close-out: L1 money path

**Commit:** `d99374b`. **Verification:** at `9e58dc2`, all eight items pass.

## What changed
- **M-002, webhook events.** Each event is claimed with `claim_stripe_event` and closed with `complete_stripe_event`.
  - A duplicate that arrives while the first copy is still processing gets a 409, so Stripe retries it.
  - A failed event is marked failed and returns 500, so it is retried, never lost.
- **M-003, stale checkout attempts.** The earlier session is checked before the attempt is abandoned.
  - If that session was paid, the response is 409 `already_paid`, with the order number.
  - The session-id write fails closed.
- **M-004, rate limits.** Checkout and order lookup go through `guardPublicRequest`.
  - Per-address limits are counted before Turnstile.
  - Shop-wide and per-email limits are counted only after a valid token.
- **M-005, payment methods.** Sessions are card-only (D2). An unpaid completion or an async event flags the order; it never changes the order's state.
- **M-006, refunds.**
  - The idempotency key includes the amount.
  - The balance is checked against Stripe plus the manual refunds.
  - Refunds are recorded through `record_stripe_refund`.
  - New handlers cover `charge.refund.updated` and `charge.dispute.created`.
- **M-007, Eircodes.** Dublin 6W is accepted, with the same regex as the storefront.
- **M-008, checkout status.** checkout-status returns `unknown` for a missing row or a bad id.
- **M-009, error responses.** Functions return fixed codes, never raw error text.

## Deferred, and why
- **A per-attempt lock against a double submit at checkout.**
  - M-003 already stops a double charge across stale attempts.
  - Two clicks inside one attempt get the same Stripe idempotency key.
  - A lock row is extra hardening that the finding did not ask for. It is listed as a follow-up.

## Noticed, not touched
- **Two new webhook events.** Add `charge.refund.updated` and `charge.dispute.created` in the Stripe dashboard only after the new webhook is live (hosted steps, stage 5).

## Do not re-audit
These were verified with file and line evidence:
- the event claim and release states;
- the path where an abandoned order is then paid;
- refund idempotency;
- the D6W regex.

The SQL half of this work is in L3.

## Rejected on merit
- None in this lane. Counting stock at checkout (P-09) was rejected under D1.
