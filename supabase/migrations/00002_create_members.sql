-- Migration: Create members table (pivot users <-> organizations)
-- B-WORK Story 1.2

create table public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  org_id uuid not null references public.organizations on delete cascade,
  role text not null check (role in ('admin', 'collaborateur')),
  invited_at timestamptz not null default now(),
  joined_at timestamptz,
  unique (user_id, org_id)
);

create index idx_members_user_org on public.members (user_id, org_id);

comment on table public.members is 'Organization membership with roles (admin, collaborateur)';
