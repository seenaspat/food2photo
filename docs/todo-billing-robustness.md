### Billing & Subscriptions — Implementation TODO

- **Objective**: Make Stripe subscriptions and credit grants reliable, secure, and misuse‑resistant. Prevent duplicate subscriptions, enforce credits on generation, and ensure portal/plan changes are handled correctly.
- **Outcome**: Users can subscribe, renew, change/cancel plans, and receive credits deterministically. Generation endpoints strictly enforce credits. Admin/debug visibility and alerts in place.

### Deliverables
- **Enforcement**: Credit reservation/finalization wrapped around generation requests (`/api/generate`, `/api/generate/route-creative`).
- **Webhooks**: Robust handlers for `checkout.session.completed`, `invoice.paid`/`invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.updated|deleted`.
- **Duplicate Subscription Guard**: Server‑side check in `create-checkout-session`; active users are routed to the Billing Portal instead of creating a new subscription.
- **Customer Portal**: Polished manage‑billing flow; clear empty‑state when no customer/subscription.
- **DB/RLS/Grants**: Correct policies on `billing_plans`; execute rights for RPC functions used by webhooks; idempotency log cleanup.
- **Observability**: Minimal structured logs, error capture, and an admin/debug endpoint to verify balances & last webhook events.
- **Docs & Tests**: Playbook for local/prod webhooks, env checklist, and happy‑/sad‑path test list.

### Tasks
- [x] Enforce credits in generation routes
  - [x] Require authenticated user in `POST /api/generate*`; return 401 otherwise.
  - [x] Before model call: `consume_credits_if_available(user_id, request_id, '/api/generate', model, metadata)`; on false → 402/429.
  - [x] After completion: `finalize_credit_usage(user_id, request_id, success)`; on failure paths, refund reservation (set usage to 0).
  - [x] Generate a deterministic `request_id` (e.g., server UUID v7) per call; persist in response for audit.

- [x] Harden `/api/billing/create-checkout-session`
  - [x] Lookup existing `user_subscriptions` for statuses `trialing|active|past_due` → if present, return `{ url: portal }` instead of creating a new session (prevents duplicates).
  - [x] Pass `customer` to Stripe Checkout so all sessions attach to the same customer.
  - [x] Option: switch to Stripe Price `lookup_key` (`pro_monthly`, `pro_yearly`) to avoid price ID drift.

- [x] Expand webhooks and idempotency
  - [x] Handle `invoice.payment_failed`: update `user_subscriptions.status`; do not grant credits.
  - [x] Handle `customer.subscription.updated`: sync `status` and period; keep `plan_code` if present.
  - [x] Handle `customer.subscription.deleted`: mark canceled; stop future grants.
  - [x] Keep grants on `invoice.paid`/`invoice.payment_succeeded`.
  - [x] Add defensive retries/backoff for transient Supabase errors.
  - [x] Periodic cleanup job for `idempotency_keys` (e.g., delete >30 days old).

- [ ] Portal UX
  - [x] Keep "Manage billing" as primary action when subscription exists; show friendly message if no subscription yet (400 today).
  - [x] Add small account page section showing plan status and renewal date.

- [ ] DB, RLS, and grants
  - [x] Ensure `billing_plans` has public read policy (added in migration 0005) and keep plan codes/quotas synced.
  - [x] Ensure execute grants for: `grant_tokens(...)` (5‑arg), `consume_credits_if_available(...)`, `finalize_credit_usage(...)` to `service_role` (webhook) and to `authenticated` where appropriate.
  - [x] Add index checks on `usage_ledger` and `user_subscriptions` (already present; verify).

- [ ] Observability & admin
  - [x] Add `/api/billing/debug` (dev‑only) to return: balance, last 5 `credit_purchases`, latest `user_subscriptions` row, and last 5 `idempotency_keys`.
  - [x] Minimal server logs on webhook grant attempts (user_id, event id, quota, success/failure).

- [ ] Testing matrix (manual/automated)
  - [ ] New subscription (monthly): credits granted on first `invoice.paid`.
  - [ ] Renewal `invoice.paid`: credits granted again.
  - [ ] Payment failed: status updated; no credits.
  - [ ] Cancel subscription: status updated; no future grants.
  - [ ] Plan change mid‑cycle: `customer.subscription.updated` syncs plan; next invoice grants new quota.
  - [ ] Generate with insufficient credits: blocked.
  - [ ] Duplicate subscription attempt: session creation returns portal link, not a new subscription.

### Acceptance Criteria
- **No duplicate subs**: Users with `trialing|active|past_due` cannot create another subscription; they are routed to the portal.
- **Deterministic credits**: Credits appear after invoice payment; renewals grant again; failures don’t grant.
- **Strict enforcement**: Generation endpoints refuse when balance is insufficient; reservations are finalized/refunded correctly.
- **Resilient webhooks**: Idempotent, retriable, and safe; events can be replayed without double‑granting.
- **Clear UX**: Pricing/portal flows work locally and in production; errors display friendly messaging.

### Open Questions
- Should subscription grants rollover or stay non‑rollover? (Current approach: non‑rollover via 0004/0006.)
- Trial behavior: immediately grant on trial start, or only after first payment?
- How many credits per plan? Align `monthly_token_quota` and UI copy.
- Do we expose credit pack purchases more prominently (top‑ups), and how do we price them?

### Notes / Best Practices
- Use Stripe Test vs Live keys appropriately; set separate `STRIPE_WEBHOOK_SECRET` for prod.
- Prefer Stripe Price `lookup_key` to avoid brittle ID storage; otherwise keep `billing_plans` synced.
- Keep webhook code minimal; never perform long operations inline. Use service‑role Supabase client only on backend.
- Keep a scheduled cleanup for `idempotency_keys`; consider an admin page for visibility.


### Production Readiness Checklist
- [ ] Stripe: Create/save Customer Portal configuration in Test and Live.
- [ ] Stripe: Set webhook endpoint URL(s) for Test and Live → copy `STRIPE_WEBHOOK_SECRET` to envs.
- [ ] Stripe: Ensure Prices with `lookup_key` (`pro_monthly`, `pro_yearly`) exist in Test and Live.
- [ ] Env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Cron: Schedule idempotency key cleanup (pg_cron or external) in production.
- [ ] Run Testing Matrix (all cases below) in Test; spot‑check Live on launch.

