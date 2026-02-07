-- Migration 00009: profiles, subscriptions, plan_limits tables
-- Adds billing/subscription infrastructure for B-WORK SaaS plans

-- =============================================================
-- 1. plan_limits (reference table)
-- =============================================================
create table public.plan_limits (
  plan text primary key check (plan in ('free', 'pro', 'business', 'enterprise')),
  max_active_tools integer,          -- null = unlimited
  max_regenerations_per_month integer, -- null = unlimited
  max_proxy_calls_per_day integer,     -- null = unlimited
  ai_model text not null,
  can_deploy boolean not null default true,
  badge_required boolean not null default false
);

insert into public.plan_limits (plan, max_active_tools, max_regenerations_per_month, max_proxy_calls_per_day, ai_model, can_deploy, badge_required) values
  ('free',       3,    5,    50,   'claude-3-haiku-20240307',    true, false),
  ('pro',        20,   50,   500,  'claude-sonnet-4-20250514',   true, false),
  ('business',   null, null, null, 'claude-sonnet-4-20250514',   true, false),
  ('enterprise', null, null, null, 'claude-opus-4-20250514',     true, false);

alter table public.plan_limits enable row level security;

create policy plan_limits_select_all
  on public.plan_limits for select
  using (true);

-- =============================================================
-- 2. profiles (extends auth.users)
-- =============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'business', 'enterprise')),
  stripe_customer_id text unique,
  tools_active_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, plan, tools_active_count)
  values (new.id, 'free', 0);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Backfill: create profiles for existing users
insert into public.profiles (id, plan, tools_active_count)
select id, 'free', 0
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;

-- updated_at trigger
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- RLS
alter table public.profiles enable row level security;

create policy profiles_select_own
  on public.profiles for select
  using (auth.uid() = id);

create policy profiles_update_own
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Service role can do everything (for webhooks)
create policy profiles_service_all
  on public.profiles for all
  using (auth.role() = 'service_role');

-- =============================================================
-- 3. subscriptions
-- =============================================================
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_subscription_id text unique not null,
  stripe_customer_id text not null,
  plan text not null check (plan in ('free', 'pro', 'business', 'enterprise')),
  status text not null check (status in ('active', 'past_due', 'canceled', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index subscriptions_stripe_sub_id_idx on public.subscriptions(stripe_subscription_id);

-- updated_at trigger
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute function public.handle_updated_at();

-- RLS
alter table public.subscriptions enable row level security;

create policy subscriptions_select_own
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Service role can do everything (for webhooks)
create policy subscriptions_service_all
  on public.subscriptions for all
  using (auth.role() = 'service_role');

-- =============================================================
-- 4. tools_active_count triggers
-- =============================================================

-- Increment when tool status changes TO 'active'
create or replace function public.increment_active_tools()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.status = 'active' and (old.status is null or old.status != 'active') then
    update public.profiles
    set tools_active_count = tools_active_count + 1,
        updated_at = now()
    where id = new.created_by;
  end if;
  return new;
end;
$$;

create trigger on_tool_activated
  after update on public.tools
  for each row
  execute function public.increment_active_tools();

-- Also handle INSERT with status='active' (rare but possible)
create trigger on_tool_insert_active
  after insert on public.tools
  for each row
  when (new.status = 'active')
  execute function public.increment_active_tools();

-- Decrement when tool status changes FROM 'active'
create or replace function public.decrement_active_tools()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.status = 'active' then
      update public.profiles
      set tools_active_count = greatest(tools_active_count - 1, 0),
          updated_at = now()
      where id = old.created_by;
    end if;
    return old;
  end if;

  -- UPDATE case
  if old.status = 'active' and new.status != 'active' then
    update public.profiles
    set tools_active_count = greatest(tools_active_count - 1, 0),
        updated_at = now()
    where id = old.created_by;
  end if;
  return new;
end;
$$;

create trigger on_tool_deactivated
  after update on public.tools
  for each row
  execute function public.decrement_active_tools();

create trigger on_tool_deleted
  after delete on public.tools
  for each row
  execute function public.decrement_active_tools();
