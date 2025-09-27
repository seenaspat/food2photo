-- Recalculate balance: purchases (including monthly grants via webhook) minus total usage
-- This removes dependency on subscription period windows so pay-as-you-go works correctly

create or replace function get_current_token_balance(user_id_input uuid)
returns bigint language plpgsql stable security definer set search_path = public as $$
declare
    purchased bigint := 0;
    refunded bigint := 0;
    used_total bigint := 0;
begin
    select coalesce(sum(tokens_granted),0) into purchased
    from credit_purchases
    where user_id = user_id_input and status in ('succeeded');

    select coalesce(sum(tokens_granted),0) into refunded
    from credit_purchases
    where user_id = user_id_input and status = 'refunded';

    select coalesce(sum(tokens_used),0) into used_total
    from usage_ledger
    where user_id = user_id_input;

    return purchased - refunded - used_total;
end;
$$;

-- Ensure credit balance wrapper stays aligned
create or replace function get_current_credit_balance(user_id_input uuid)
returns bigint language sql stable security definer set search_path = public as $$
    select get_current_token_balance(user_id_input);
$$;


