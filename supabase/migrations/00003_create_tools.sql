-- Migration: Create tools table
-- B-WORK Story 1.2

create table public.tools (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations on delete cascade,
  created_by uuid not null references auth.users,
  name text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'generating', 'active', 'disabled')),
  artifact jsonb,
  code_storage_path text,
  access_type text not null default 'public' check (access_type in ('public', 'restricted')),
  access_code_hash text,
  deployed_url text,
  deployed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tools_org_id on public.tools (org_id);

comment on table public.tools is 'User-created tools with JSON business artifact';
