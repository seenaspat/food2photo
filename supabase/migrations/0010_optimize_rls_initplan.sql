-- Optimize RLS policies that call auth.* per-row by wrapping in a SELECT, per
-- https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
-- Idempotent: drop and recreate affected policies.

-- profiles
drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner"
on public.profiles for select
using ((select auth.uid()) = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
on public.profiles for update
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- user_subscriptions
drop policy if exists user_subscriptions_read_self on public.user_subscriptions;
create policy user_subscriptions_read_self on public.user_subscriptions
for select using ((select auth.uid()) = user_id);

-- usage_ledger
drop policy if exists usage_ledger_read_self on public.usage_ledger;
create policy usage_ledger_read_self on public.usage_ledger
for select using ((select auth.uid()) = user_id);

-- credit_purchases
drop policy if exists credit_purchases_read_self on public.credit_purchases;
create policy credit_purchases_read_self on public.credit_purchases
for select using ((select auth.uid()) = user_id);

-- api_request_log
drop policy if exists api_request_log_read_self on public.api_request_log;
create policy api_request_log_read_self on public.api_request_log
for select using ((select auth.uid()) = user_id);

drop policy if exists api_request_log_insert_auth on public.api_request_log;
create policy api_request_log_insert_auth on public.api_request_log
for insert to authenticated with check ((select auth.uid()) = user_id);


