-- Migration: Create provision_user_org function for auto-provisioning
-- Handles org + member creation in one transaction, bypassing trigger issues
-- when called from service role (where auth.uid() is null).

create or replace function public.provision_user_org(
  p_user_id uuid,
  p_org_id uuid,
  p_org_name text,
  p_org_slug text
)
returns void
language plpgsql
security definer
as $$
begin
  -- Temporarily disable the trigger that auto-creates member on org insert
  -- (it uses auth.uid() which is null when called from service role)
  alter table public.organizations disable trigger on_organization_created;

  insert into public.organizations (id, name, slug)
  values (p_org_id, p_org_name, p_org_slug);

  insert into public.members (user_id, org_id, role, joined_at)
  values (p_user_id, p_org_id, 'admin', now());

  -- Re-enable the trigger
  alter table public.organizations enable trigger on_organization_created;
end;
$$;
