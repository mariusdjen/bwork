-- Migration: Enable RLS and create policies for all tables
-- B-WORK Story 1.2
-- Convention: {table}_{action}_{role}

-- ============================================
-- Enable RLS on all tables
-- ============================================
alter table public.organizations enable row level security;
alter table public.members enable row level security;
alter table public.tools enable row level security;
alter table public.generations enable row level security;

-- ============================================
-- Helper: check if user is member of an org
-- ============================================
create or replace function public.is_org_member(check_org_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.members
    where members.org_id = check_org_id
      and members.user_id = auth.uid()
  );
$$;

-- Helper: check if user is admin of an org
create or replace function public.is_org_admin(check_org_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.members
    where members.org_id = check_org_id
      and members.user_id = auth.uid()
      and members.role = 'admin'
  );
$$;

-- ============================================
-- Trigger: auto-insert creator as admin member on org creation
-- Solves chicken-and-egg: creator must be member to see/manage their org
-- ============================================
create or replace function public.handle_new_organization()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.members (user_id, org_id, role, joined_at)
  values (auth.uid(), new.id, 'admin', now());
  return new;
end;
$$;

create trigger on_organization_created
  after insert on public.organizations
  for each row
  execute function public.handle_new_organization();

-- ============================================
-- Trigger: auto-update updated_at on tools
-- ============================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_tools_updated
  before update on public.tools
  for each row
  execute function public.handle_updated_at();

-- ============================================
-- Organizations policies
-- ============================================
create policy organizations_select_member
  on public.organizations for select
  using (public.is_org_member(id));

create policy organizations_insert_authenticated
  on public.organizations for insert
  with check (auth.uid() is not null);

create policy organizations_update_admin
  on public.organizations for update
  using (public.is_org_admin(id));

-- ============================================
-- Members policies
-- ============================================
create policy members_select_member
  on public.members for select
  using (public.is_org_member(org_id));

create policy members_insert_admin
  on public.members for insert
  with check (public.is_org_admin(org_id));

create policy members_update_admin
  on public.members for update
  using (public.is_org_admin(org_id));

create policy members_delete_admin
  on public.members for delete
  using (public.is_org_admin(org_id));

-- ============================================
-- Tools policies
-- ============================================
create policy tools_select_member
  on public.tools for select
  using (public.is_org_member(org_id));

create policy tools_insert_member
  on public.tools for insert
  with check (
    public.is_org_member(org_id)
    and created_by = auth.uid()
  );

create policy tools_update_owner_or_admin
  on public.tools for update
  using (
    created_by = auth.uid()
    or public.is_org_admin(org_id)
  );

create policy tools_delete_admin
  on public.tools for delete
  using (public.is_org_admin(org_id));

-- ============================================
-- Generations policies
-- ============================================
create policy generations_select_member
  on public.generations for select
  using (
    exists (
      select 1 from public.tools
      where tools.id = generations.tool_id
        and public.is_org_member(tools.org_id)
    )
  );

create policy generations_insert_member
  on public.generations for insert
  with check (
    exists (
      select 1 from public.tools
      where tools.id = tool_id
        and public.is_org_member(tools.org_id)
    )
    and triggered_by = auth.uid()
  );
