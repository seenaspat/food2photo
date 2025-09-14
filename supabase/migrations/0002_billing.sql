-- Enums (idempotent): crear solo si no existen
do $$
begin
    if not exists (
        select 1
        from pg_type t
        join pg_namespace n on n.oid = t.typnamespace
        where t.typname = 'subscription_status' and n.nspname = 'public'
    ) then
        create type subscription_status as enum ('incomplete','trialing','active','past_due','canceled','unpaid');
    end if;
end$$;

do $$
begin
    if not exists (
        select 1
        from pg_type t
        join pg_namespace n on n.oid = t.typnamespace
        where t.typname = 'credit_purchase_status' and n.nspname = 'public'
    ) then
        create type credit_purchase_status as enum ('requires_payment','succeeded','canceled','refunded');
    end if;
end$$;

-- Tables
create table if not exists billing_plans (
	id bigint generated always as identity primary key,
	code text unique not null,
	name text not null,
	monthly_token_quota bigint not null check (monthly_token_quota >= 0),
	monthly_price_cents integer not null check (monthly_price_cents >= 0),
	features jsonb not null default '{}'::jsonb,
	stripe_product_id text,
	stripe_price_id text,
	created_at timestamptz not null default now()
);

create table if not exists user_subscriptions (
	id bigint generated always as identity primary key,
	user_id uuid not null references auth.users(id) on delete cascade,
	plan_code text not null references billing_plans(code),
	status subscription_status not null,
	current_period_start timestamptz,
	current_period_end timestamptz,
	stripe_customer_id text,
	stripe_subscription_id text unique,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);
create index if not exists idx_user_subscriptions_user_id on user_subscriptions(user_id);
create index if not exists idx_user_subscriptions_sub_id on user_subscriptions(stripe_subscription_id);

create table if not exists usage_ledger (
	id bigint generated always as identity primary key,
	user_id uuid not null references auth.users(id) on delete cascade,
	request_id text not null,
	api_route text not null,
	tokens_used bigint not null check (tokens_used >= 0),
	model text,
	metadata jsonb not null default '{}'::jsonb,
	created_at timestamptz not null default now(),
	unique (user_id, request_id)
);
create index if not exists idx_usage_ledger_user_time on usage_ledger(user_id, created_at desc);
create index if not exists idx_usage_ledger_request on usage_ledger(request_id);

create table if not exists credit_purchases (
	id bigint generated always as identity primary key,
	user_id uuid not null references auth.users(id) on delete cascade,
	tokens_granted bigint not null check (tokens_granted >= 0),
	stripe_payment_intent_id text,
	status credit_purchase_status not null,
	created_at timestamptz not null default now()
);
create index if not exists idx_credit_purchases_user_time on credit_purchases(user_id, created_at desc);

create table if not exists idempotency_keys (
	key text primary key,
	user_id uuid,
	created_at timestamptz not null default now(),
	expires_at timestamptz
);

-- Request logging for rate limiting
create table if not exists api_request_log (
	id bigint generated always as identity primary key,
	user_id uuid,
	ip inet,
	api_route text not null,
	created_at timestamptz not null default now()
);
create index if not exists idx_api_request_log_user_time on api_request_log(user_id, created_at desc);
create index if not exists idx_api_request_log_ip_time on api_request_log(ip, created_at desc);

-- RLS
alter table billing_plans enable row level security;
alter table user_subscriptions enable row level security;
alter table usage_ledger enable row level security;
alter table credit_purchases enable row level security;
alter table idempotency_keys enable row level security;
alter table api_request_log enable row level security;

-- Policies: users can read their own rows
drop policy if exists user_subscriptions_read_self on user_subscriptions;
create policy user_subscriptions_read_self on user_subscriptions
	for select using (auth.uid() = user_id);
drop policy if exists usage_ledger_read_self on usage_ledger;
create policy usage_ledger_read_self on usage_ledger
	for select using (auth.uid() = user_id);
drop policy if exists credit_purchases_read_self on credit_purchases;
create policy credit_purchases_read_self on credit_purchases
	for select using (auth.uid() = user_id);
drop policy if exists api_request_log_read_self on api_request_log;
create policy api_request_log_read_self on api_request_log
	for select using (auth.uid() = user_id);

-- Insert policies via functions only; allow service role
drop policy if exists usage_ledger_insert_service on usage_ledger;
create policy usage_ledger_insert_service on usage_ledger
	for insert to service_role with check (true);
drop policy if exists credit_purchases_insert_service on credit_purchases;
create policy credit_purchases_insert_service on credit_purchases
	for insert to service_role with check (true);
drop policy if exists user_subscriptions_upsert_service on user_subscriptions;
create policy user_subscriptions_upsert_service on user_subscriptions
	for all to service_role using (true) with check (true);
drop policy if exists api_request_log_insert_auth on api_request_log;
create policy api_request_log_insert_auth on api_request_log
	for insert to authenticated with check (auth.uid() = user_id);

-- Utility views or sums are internal; balances via functions below

-- Functions: SECURITY DEFINER
-- Helper: calculate monthly subscription credits used within current period
create or replace function get_subscription_period(user_id_input uuid)
returns table(period_start timestamptz, period_end timestamptz) language sql stable as $$
	select current_period_start, current_period_end
	from user_subscriptions
	where user_id = user_id_input and status in ('trialing','active','past_due')
	order by coalesce(current_period_end, now()) desc
	limit 1;
$$;

create or replace function get_current_token_balance(user_id_input uuid)
returns bigint language plpgsql stable security definer set search_path = public as $$
declare
	plan_code text;
	quota bigint := 0;
	period_start timestamptz;
	period_end timestamptz;
	used_in_period bigint := 0;
	purchased bigint := 0;
	refunded bigint := 0;
begin
	select us.plan_code into plan_code
	from user_subscriptions us
	where us.user_id = user_id_input and us.status in ('trialing','active','past_due')
	order by coalesce(us.current_period_end, now()) desc limit 1;

	if plan_code is not null then
		select bp.monthly_token_quota into quota from billing_plans bp where bp.code = plan_code;
	end if;
	select (g.period_start, g.period_end) into period_start, period_end from get_subscription_period(user_id_input) g limit 1;
	if period_start is not null and period_end is not null then
		select coalesce(sum(tokens_used),0) into used_in_period
		from usage_ledger
		where user_id = user_id_input and created_at >= period_start and created_at < period_end;
	end if;
	select coalesce(sum(tokens_granted),0) into purchased from credit_purchases where user_id = user_id_input and status in ('succeeded');
	-- For simplicity, refunds subtract from purchases where status='refunded'
	select coalesce(sum(tokens_granted),0) into refunded from credit_purchases where user_id = user_id_input and status = 'refunded';
	return quota + purchased - refunded - used_in_period;
end;
$$;

create or replace function grant_tokens(user_id_input uuid, tokens bigint, reason text, metadata jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
	insert into credit_purchases(user_id, tokens_granted, stripe_payment_intent_id, status, created_at)
	values (user_id_input, tokens, null, 'succeeded', now());
end;
$$;

-- Atomic reservation based on optimistic insert of a provisional usage row with estimated tokens (could be 1 for credits)
create or replace function consume_tokens_if_available(
	user_id_input uuid,
	request_id_input text,
	api_route_input text,
	estimated_tokens bigint,
	model_input text,
	metadata_input jsonb
) returns boolean language plpgsql security definer set search_path = public as $$
declare
	balance bigint;
begin
	select get_current_token_balance(user_id_input) into balance;
	if balance < estimated_tokens then
		return false;
	end if;
	insert into usage_ledger(user_id, request_id, api_route, tokens_used, model, metadata)
	values (user_id_input, request_id_input, api_route_input, estimated_tokens, model_input, metadata_input);
	return true;
exception when unique_violation then
	-- idempotent retry
	return true;
end;
$$;

create or replace function finalize_token_usage(
	user_id_input uuid,
	request_id_input text,
	actual_tokens bigint,
	model_input text,
	metadata_input jsonb
) returns void language plpgsql security definer set search_path = public as $$
begin
	update usage_ledger
	set tokens_used = greatest(0, actual_tokens), metadata = coalesce(metadata, '{}'::jsonb) || coalesce(metadata_input, '{}'::jsonb)
	where user_id = user_id_input and request_id = request_id_input;
end;
$$;

-- Credit wrappers: 1 credit == 1 token for simplicity
create or replace function get_current_credit_balance(user_id_input uuid)
returns bigint language sql stable security definer set search_path = public as $$
	select get_current_token_balance(user_id_input);
$$;

create or replace function consume_credits_if_available(
	user_id_input uuid,
	request_id_input text,
	api_route_input text,
	model_input text,
	metadata_input jsonb
) returns boolean language sql security definer set search_path = public as $$
	select consume_tokens_if_available(user_id_input, request_id_input, api_route_input, 1, model_input, metadata_input);
$$;

create or replace function finalize_credit_usage(
	user_id_input uuid,
	request_id_input text,
	success boolean
) returns void language plpgsql security definer set search_path = public as $$
begin
	if success is true then
		perform 1; -- keep the reservation (already counted as 1)
	else
		-- refund reservation by setting usage to 0
		update usage_ledger set tokens_used = 0 where user_id = user_id_input and request_id = request_id_input;
	end if;
end;
$$;

-- Grants
grant execute on function get_current_token_balance(uuid) to authenticated, service_role;
grant execute on function consume_tokens_if_available(uuid, text, text, bigint, text, jsonb) to authenticated, service_role;
grant execute on function finalize_token_usage(uuid, text, bigint, text, jsonb) to authenticated, service_role;
grant execute on function grant_tokens(uuid, bigint, text, jsonb) to service_role;

grant execute on function get_current_credit_balance(uuid) to authenticated, service_role;
grant execute on function consume_credits_if_available(uuid, text, text, text, jsonb) to authenticated, service_role;
grant execute on function finalize_credit_usage(uuid, text, boolean) to authenticated, service_role;
