-- Add subscription snapshot fields to harden periodic grants

alter table if exists public.user_subscriptions
  add column if not exists plan_quota_snapshot bigint,
  add column if not exists granted_period_start timestamptz;

-- Helpful index to query latest by user quickly
create index if not exists idx_user_subscriptions_user_created_desc
  on public.user_subscriptions(user_id, created_at desc);


