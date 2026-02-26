-- VibeQuest Database Schema

-- Parent profiles (linked to Clerk user IDs)
create table if not exists profiles (
  id text primary key,             -- same as clerk_user_id for simplicity
  clerk_user_id text unique not null,
  email text not null,
  created_at timestamptz default now()
);

-- Child profiles (kids attached to a parent account)
create table if not exists child_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_id text references profiles(id) on delete cascade,
  name text not null,
  age integer not null check (age between 3 and 18),
  tier integer not null check (tier in (1, 2, 3)),
  avatar text default '🧒',
  created_at timestamptz default now()
);

-- Stripe subscription state (mirrored from webhooks)
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  parent_id text unique references profiles(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  plan text not null check (plan in ('monthly', 'annual', 'family')),
  status text not null check (status in ('active', 'canceled', 'past_due')),
  current_period_end timestamptz not null,
  created_at timestamptz default now()
);

-- Mission progress per child
create table if not exists mission_progress (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references child_profiles(id) on delete cascade,
  mission_id text not null,
  completed boolean default false,
  attempts integer default 0,
  badge text,
  completed_at timestamptz,
  unique (child_id, mission_id)
);

-- Row Level Security
alter table profiles enable row level security;
alter table child_profiles enable row level security;
alter table subscriptions enable row level security;
alter table mission_progress enable row level security;

-- Policies: service role bypasses RLS (used by server routes)
-- These policies allow authenticated reads via anon key if needed

create policy "profiles: own row" on profiles
  for all using (clerk_user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "child_profiles: own children" on child_profiles
  for all using (
    parent_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

create policy "subscriptions: own" on subscriptions
  for all using (
    parent_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

create policy "mission_progress: own children" on mission_progress
  for all using (
    child_id in (
      select id from child_profiles
      where parent_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );
