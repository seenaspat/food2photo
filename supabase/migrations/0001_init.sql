-- food2photo initial schema: profiles, subscriptions, backgrounds, storage
-- This migration is idempotent where possible to support safe re-runs.

-- Extensions
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_public_profiles_updated_at on public.profiles;
create trigger set_public_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Auto-create profile when a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.profiles enable row level security;

-- Profiles RLS: owner can read and update
drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- Subscriptions
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type public.subscription_status as enum (
      'trialing','active','past_due','canceled','incomplete','incomplete_expired','paused'
    );
  end if;
end$$;

create table if not exists public.subscription_plans (
  id text primary key,                             -- e.g. 'free', 'pro'
  stripe_price_id text unique,
  name text not null,
  description text,
  currency text not null default 'usd',
  amount integer not null,                         -- cents
  interval text not null,                          -- 'month' | 'year'
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id text not null references public.subscription_plans(id),
  stripe_subscription_id text unique,
  status public.subscription_status not null default 'active',
  trial_end timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);

drop trigger if exists set_public_subscriptions_updated_at on public.subscriptions;
create trigger set_public_subscriptions_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

drop policy if exists "Owner can read their subscriptions" on public.subscriptions;
create policy "Owner can read their subscriptions"
on public.subscriptions for select
using (auth.uid() = user_id);

drop policy if exists "Owner can insert their subscriptions" on public.subscriptions;
create policy "Owner can insert their subscriptions"
on public.subscriptions for insert
with check (auth.uid() = user_id);

drop policy if exists "Owner can update their subscriptions" on public.subscriptions;
create policy "Owner can update their subscriptions"
on public.subscriptions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Backgrounds metadata (files live in Storage)
-- ----------------------------------------------------------------------------
create table if not exists public.backgrounds (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,                        -- human/lookup key
  version text,
  file_path text not null,                          -- storage path within 'backgrounds' bucket
  width integer not null,
  height integer not null,
  dominant_hex text,
  sha256 text,
  prompt jsonb,
  tags text[],
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_backgrounds_version on public.backgrounds(version);
create index if not exists idx_backgrounds_tags on public.backgrounds using gin(tags);

alter table public.backgrounds enable row level security;

drop policy if exists "Backgrounds are publicly readable" on public.backgrounds;
create policy "Backgrounds are publicly readable"
on public.backgrounds for select
using (true);

-- ----------------------------------------------------------------------------
-- Storage bucket + policy for public read access
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'backgrounds') then
    insert into storage.buckets (id, name, public)
    values ('backgrounds', 'backgrounds', true);
  end if;
end$$;

-- Public read for objects in the 'backgrounds' bucket
drop policy if exists "Public read backgrounds" on storage.objects;
create policy "Public read backgrounds"
on storage.objects for select
using (bucket_id = 'backgrounds');


