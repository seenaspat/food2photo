-- Fix period destructuring in get_current_token_balance (was selecting a row value
-- into two timestamptz vars, causing an invalid timestamp cast). Use explicit
-- column list instead of (..,..).

create or replace function get_current_token_balance(user_id_input uuid)
returns bigint
language plpgsql
stable
security definer
set search_path = public
as $$
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
    -- Correctly assign both timestamps
    select g.period_start, g.period_end
      into period_start, period_end
    from get_subscription_period(user_id_input) g
    limit 1;

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

-- Ensure the credit balance wrapper points to the corrected function
create or replace function get_current_credit_balance(user_id_input uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
    select get_current_token_balance(user_id_input);
$$;


