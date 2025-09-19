-- Allow public read access to billing_plans so the API can look up Stripe prices
-- Idempotent: drop existing policy if present, then create

alter table if exists public.billing_plans enable row level security;

drop policy if exists "Public read billing plans" on public.billing_plans;
create policy "Public read billing plans"
on public.billing_plans for select
using (true);


