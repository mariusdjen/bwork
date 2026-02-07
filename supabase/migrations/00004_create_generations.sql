-- Migration: Create generations table
-- B-WORK Story 1.2

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references public.tools on delete cascade,
  triggered_by uuid not null references auth.users,
  status text not null default 'pending' check (status in ('pending', 'streaming', 'complete', 'failed')),
  provider text,
  model text,
  tokens_used integer,
  duration_ms integer,
  cost_estimate numeric(10, 4),
  error_message text,
  created_at timestamptz not null default now()
);

create index idx_generations_tool_id on public.generations (tool_id);

comment on table public.generations is 'AI generation runs linked to tools';
