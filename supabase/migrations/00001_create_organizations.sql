-- Migration: Create organizations table
-- B-WORK Story 1.2

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

comment on table public.organizations is 'Organizations (multi-tenant isolation unit)';
