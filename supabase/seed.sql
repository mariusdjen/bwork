-- Seed data for B-WORK local development
-- Run with: supabase db reset
-- Seeds run as postgres role (bypasses RLS)

-- Test organization
insert into public.organizations (id, name, slug)
values (
  'a0000000-0000-0000-0000-000000000001',
  'B-WORK Demo',
  'b-work-demo'
);

-- Note: The on_organization_created trigger will NOT fire here because
-- seeds run as postgres, not as an authenticated user (auth.uid() is null).
-- After creating a test user via Supabase Auth Dashboard or API,
-- manually add them as admin:
--
--   insert into public.members (user_id, org_id, role, joined_at)
--   values ('<your-test-user-uuid>', 'a0000000-0000-0000-0000-000000000001', 'admin', now());
--
--   insert into public.tools (org_id, created_by, name, description, status)
--   values (
--     'a0000000-0000-0000-0000-000000000001',
--     '<your-test-user-uuid>',
--     'Suivi de demandes',
--     'Un outil simple pour suivre les demandes internes',
--     'draft'
--   );
