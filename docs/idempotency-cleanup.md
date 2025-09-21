### Idempotency Keys Cleanup — Setup & Run

#### What & Why
- **Idempotency keys** let us process Stripe webhooks at most once. We record `event.id` in `public.idempotency_keys` before applying side-effects (credits, subscription updates). If an event is retried/replayed, the insert conflicts and we safely no-op.
- **Cleanup** prevents the table from growing forever. Stripe retries are short-lived, so keeping keys beyond 30–90 days has little value.

#### Table
- Table: `public.idempotency_keys (key text primary key, user_id uuid null, created_at timestamptz, expires_at timestamptz null)`
- Created by migration `0002_billing.sql`.

---

### Local / Dev Cleanup
- Dev-only endpoint exists: `POST /api/billing/idempotency-cleanup`
- Retention window: `IDEMPOTENCY_CLEANUP_DAYS` (default: 30)

Examples:

```bash
# Delete keys older than default (30 days)
curl -X POST http://localhost:3000/api/billing/idempotency-cleanup

# Override retention via env just for this run
IDEMPOTENCY_CLEANUP_DAYS=60 curl -X POST http://localhost:3000/api/billing/idempotency-cleanup
```

Notes:
- The route is disabled in production (returns 403). Use one of the production options below.

---

### Production Options

#### Option A — Supabase scheduled SQL (pg_cron)
Run the cleanup entirely inside Postgres (recommended for simplicity and reliability).

SQL (run in Supabase SQL Editor):

```sql
-- 1) Enable pg_cron (one-time)
create extension if not exists pg_cron with schema extensions;

-- 2) Schedule daily cleanup at 03:15 UTC (adjust as desired)
select cron.schedule(
  'cleanup_idempotency_keys',             -- job name
  '15 3 * * *',                           -- cron: min hour dom mon dow
  $$delete from public.idempotency_keys 
    where created_at < now() - interval '30 days';$$
);

-- 3) Verify jobs
select * from cron.job;
-- Optional: inspect run details
select * from cron.job_run_details order by start_time desc limit 20;

-- 4) Change schedule or retention later
select cron.alter_job('cleanup_idempotency_keys', schedule => '0 4 * * *');
-- Change the interval in the SQL body above and re-schedule if needed

-- 5) Unschedule (if needed)
select cron.unschedule('cleanup_idempotency_keys');
```

Tips:
- Use fully-qualified table name `public.idempotency_keys`.
- The 30-day window is a reasonable default. Adjust to your audit needs (e.g., 60 or 90 days).

#### Option B — Vercel Cron hitting an API route
If you prefer app-managed scheduling:
- Convert or add a production-safe cleanup route that requires a secret header (e.g., `X-Cleanup-Secret`).
- Configure Vercel Cron (Dashboard → Project → Settings → Cron Jobs) to POST to that route daily with the header.
- Keep `IDEMPOTENCY_CLEANUP_DAYS` in your environment for retention control.

Example request (once you have a protected prod route):

```bash
curl -X POST https://yourdomain.com/api/billing/idempotency-cleanup \
  -H "X-Cleanup-Secret: $CLEANUP_SECRET"
```

---

### Safety & Validation
- Dry-run count before deleting:

```sql
select count(*)
from public.idempotency_keys
where created_at < now() - interval '30 days';
```

- The cleanup only deletes historical idempotency records; it does not touch billing data or balances.

### Troubleshooting
- If cron doesn’t run: confirm `pg_cron` is enabled and the job exists in `cron.job`.
- If the app endpoint returns 403 in production: that is expected for the dev-only route; use Option A or deploy a protected prod route.


