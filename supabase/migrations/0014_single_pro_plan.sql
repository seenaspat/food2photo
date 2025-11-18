-- Consolidate plans into single Pro tier (60 generations / $19)
-- 1) Upsert the pro_monthly billing plan with the new quota & price
-- 2) Mark legacy basic_* plans as archived
-- 3) Remap any lingering subscriptions to pro_monthly

begin;

insert into billing_plans (code, name, monthly_token_quota, monthly_price_cents, features)
values (
    'pro_monthly',
    'Pro',
    60,
    1900,
    coalesce((select features from billing_plans where code = 'pro_monthly'), '{}'::jsonb)
)
on conflict (code) do update
set name = excluded.name,
    monthly_token_quota = excluded.monthly_token_quota,
    monthly_price_cents = excluded.monthly_price_cents;

-- Soft-archive the Basic plans but keep rows for historical data.
update billing_plans
set name = regexp_replace(name || ' (archived)', '\\s*\\(archived\\)$', ' (archived)'),
    monthly_token_quota = monthly_token_quota
where code ilike 'basic_%';

-- Ensure any existing subscriptions now reference the pro plan.
update user_subscriptions
set plan_code = 'pro_monthly'
where plan_code in ('basic_monthly', 'basic_yearly', 'pro_yearly')
   or plan_code is null;

commit;
