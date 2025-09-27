-- Credit grant kind + 5-arg grant_tokens

-- Enum for credit grant kinds (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'credit_grant_kind' and n.nspname = 'public'
  ) then
    create type credit_grant_kind as enum ('topup','subscription');
  end if;
end$$;

-- Add column to credit_purchases if missing
alter table if exists public.credit_purchases
  add column if not exists kind credit_grant_kind;

-- Default and backfill
alter table if exists public.credit_purchases
  alter column kind set default 'topup';

update public.credit_purchases
set kind = 'topup'
where kind is null;

alter table if exists public.credit_purchases
  alter column kind set not null;

-- 5-arg grant_tokens (with kind)
-- Drop existing signature first if it exists (to remove defaults/reshape args)
do $$
begin
  perform 1 from pg_proc p
    join pg_namespace n on n.oid=p.pronamespace
   where n.nspname='public' and p.proname='grant_tokens' and pg_get_function_arguments(p.oid) like '%credit_grant_kind%';
  if found then
    execute 'drop function if exists public.grant_tokens(uuid, bigint, text, jsonb, credit_grant_kind)';
  end if;
exception when others then
  null;
end$$;
create or replace function public.grant_tokens(
  user_id_input uuid,
  tokens bigint,
  reason text,
  metadata jsonb,
  kind credit_grant_kind
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into credit_purchases(user_id, tokens_granted, stripe_payment_intent_id, status, kind, created_at)
  values (
    user_id_input,
    tokens,
    coalesce(metadata->>'stripe_payment_intent_id', null),
    'succeeded',
    kind,
    now()
  );
end;
$$;

-- Backwards-compatible 4-arg version delegating to 5-arg ('topup' default)
create or replace function public.grant_tokens(
  user_id_input uuid,
  tokens bigint,
  reason text,
  metadata jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.grant_tokens(user_id_input, tokens, reason, metadata, 'topup');
end;
$$;

-- Grants
grant execute on function public.grant_tokens(uuid, bigint, text, jsonb, credit_grant_kind) to service_role;
grant execute on function public.grant_tokens(uuid, bigint, text, jsonb) to service_role;


