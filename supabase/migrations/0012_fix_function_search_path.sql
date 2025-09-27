-- Set explicit search_path for functions flagged by linter

-- set_updated_at: already defined in 0001; recreate with SET SEARCH_PATH
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- get_subscription_period: from 0002; recreate with SET SEARCH_PATH
create or replace function public.get_subscription_period(user_id_input uuid)
returns table(period_start timestamptz, period_end timestamptz)
language sql
set search_path = public
as $$
  select current_period_start, current_period_end
  from user_subscriptions
  where user_id = user_id_input and status in ('trialing','active','past_due')
  order by coalesce(current_period_end, now()) desc
  limit 1;
$$;


