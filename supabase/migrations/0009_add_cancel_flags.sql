-- Add cancellation flags to user_subscriptions for accurate UX messaging

alter table if exists public.user_subscriptions
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists cancel_at timestamptz,
  add column if not exists canceled_at timestamptz;


