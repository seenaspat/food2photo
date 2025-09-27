-- Introduce credit_grant_kind and compute balance without rollover of subscription quota

-- Enum for credit purchase kind
do $$
begin
    if not exists (
        select 1 from pg_type t join pg_namespace n on n.oid=t.typnamespace
        where t.typname='credit_grant_kind' and n.nspname='public'
    ) then
        create type credit_grant_kind as enum ('subscription','topup');
    end if;
end$$;

-- Add kind column to credit_purchases
do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_schema='public' and table_name='credit_purchases' and column_name='kind'
    ) then
        alter table credit_purchases add column kind credit_grant_kind not null default 'topup';
    end if;
end$$;

update credit_purchases set kind='topup' where kind is null;

-- Update grant_tokens to accept kind
create or replace function grant_tokens(
    user_id_input uuid,
    tokens bigint,
    reason text,
    metadata jsonb,
    kind credit_grant_kind default 'topup'
) returns void language plpgsql security definer set search_path = public as $$
begin
    insert into credit_purchases(user_id, tokens_granted, stripe_payment_intent_id, status, created_at, kind)
    values (user_id_input, tokens, null, 'succeeded', now(), kind);
end;
$$;

-- Non-rollover balance:
-- Remaining topups after covering all pre-period usage in excess of prior subscription grants,
-- plus current period subscription grants, minus current period usage.
create or replace function get_current_token_balance(user_id_input uuid)
returns bigint language plpgsql stable security definer set search_path = public as $$
declare
    period_start timestamptz;
    period_end timestamptz;
    topups_total bigint := 0;
    topups_refunded bigint := 0;
    sub_grants_before bigint := 0;
    sub_grants_current bigint := 0;
    usage_before bigint := 0;
    usage_current bigint := 0;
    topups_consumed_before bigint := 0;
    topups_remaining bigint := 0;
begin
    select (g.period_start, g.period_end) into period_start, period_end from get_subscription_period(user_id_input) g limit 1;

    select coalesce(sum(tokens_granted),0) into topups_total
    from credit_purchases
    where user_id = user_id_input and status in ('succeeded') and kind='topup';

    select coalesce(sum(tokens_granted),0) into topups_refunded
    from credit_purchases
    where user_id = user_id_input and status = 'refunded' and kind='topup';

    topups_total := topups_total - topups_refunded;

    if period_start is null or period_end is null then
        -- No active subscription period: pure pay-as-you-go
        select coalesce(sum(tokens_used),0) into usage_before from usage_ledger where user_id = user_id_input;
        return greatest(0, topups_total - usage_before);
    end if;

    -- Subscription grants before current period
    select coalesce(sum(tokens_granted),0) into sub_grants_before
    from credit_purchases
    where user_id = user_id_input and kind='subscription' and status in ('succeeded') and created_at < period_start;

    -- Usage segmentation
    select coalesce(sum(tokens_used),0) into usage_before from usage_ledger
    where user_id = user_id_input and created_at < period_start;

    select coalesce(sum(tokens_used),0) into usage_current from usage_ledger
    where user_id = user_id_input and created_at >= period_start and created_at < period_end;

    -- Current period subscription grants
    select coalesce(sum(tokens_granted),0) into sub_grants_current
    from credit_purchases
    where user_id = user_id_input and kind='subscription' and status in ('succeeded')
      and created_at >= period_start and created_at < period_end;

    -- Topups consumed before period are only the excess of usage over prior subscription grants
    topups_consumed_before := greatest(0, usage_before - sub_grants_before);
    topups_remaining := greatest(0, topups_total - topups_consumed_before);

    return topups_remaining + sub_grants_current - usage_current;
end;
$$;

create or replace function get_current_credit_balance(user_id_input uuid)
returns bigint language sql stable security definer set search_path = public as $$
    select get_current_token_balance(user_id_input);
$$;


